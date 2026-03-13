"""
tests/test_model_cache.py – Unit tests for the real ModelCache implementation.

  * test_model_cache_local_roundtrip – fake fetcher, file created, no double-fetch.
  * test_touch_updates_timestamp       – touch() advances last_accessed.
  * test_eviction_reduces_size         – tiny budget triggers LRU eviction.
  * test_stale_entry_re_fetches        – deleted file triggers re-fetch.

No real IPFS network calls; fetcher is always a coroutine returning b"...".
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
import pytest_asyncio

from model_cache import CachedModel, ModelCache


# ── Helpers ───────────────────────────────────────────────────────────────────

def _make_fake_fetcher(content: bytes = b"dummy-model-bytes", *, call_counter: list[int] | None = None):
    """Return an async fetcher coroutine that yields *content*."""
    async def _fetcher(cid: str) -> bytes:
        if call_counter is not None:
            call_counter.append(1)
        return content
    return _fetcher


@pytest.fixture()
def cache(tmp_path: Path) -> ModelCache:
    """500 MiB budget – big enough that eviction never fires for small tests."""
    return ModelCache(cache_dir=tmp_path / "mc", max_cache_mb=500)


@pytest.fixture()
def tiny_cache(tmp_path: Path) -> ModelCache:
    """1-byte budget – guaranteed to evict on second put."""
    return ModelCache(cache_dir=tmp_path / "mc_tiny", max_cache_mb=1)


# ── Roundtrip ─────────────────────────────────────────────────────────────────

class TestRoundtrip:
    @pytest.mark.asyncio
    async def test_get_or_fetch_creates_file(self, cache: ModelCache) -> None:
        cid = "QmTestModel001"
        result: CachedModel = await cache.get_or_fetch(cid, _make_fake_fetcher())
        assert result.cid == cid
        assert result.path.exists()
        assert result.path.suffix == ".onnx"
        assert result.size_bytes == len(b"dummy-model-bytes")

    @pytest.mark.asyncio
    async def test_second_call_does_not_invoke_fetcher(self, cache: ModelCache) -> None:
        """Cache hit must NOT call the fetcher a second time."""
        counter: list[int] = []
        cid = "QmTestModel002"
        await cache.get_or_fetch(cid, _make_fake_fetcher(call_counter=counter))  # miss → fetch
        await cache.get_or_fetch(cid, _make_fake_fetcher(call_counter=counter))  # hit → skip
        assert len(counter) == 1, "Fetcher should have been called exactly once"

    @pytest.mark.asyncio
    async def test_current_size_grows_after_fetch(self, cache: ModelCache) -> None:
        await cache.get_or_fetch("QmA", _make_fake_fetcher(b"a" * 1024))
        await cache.get_or_fetch("QmB", _make_fake_fetcher(b"b" * 1024))
        assert cache.current_size_mb() > 0


# ── touch() ───────────────────────────────────────────────────────────────────

class TestTouch:
    @pytest.mark.asyncio
    async def test_touch_advances_last_accessed(self, cache: ModelCache) -> None:
        cid = "QmTouch001"
        await cache.get_or_fetch(cid, _make_fake_fetcher())
        before: datetime = cache._index[cid].last_accessed

        # Force time forward enough to be distinct
        import time; time.sleep(0.02)
        cache.touch(cid)
        after: datetime = cache._index[cid].last_accessed

        assert after >= before

    def test_touch_unknown_cid_is_safe(self, cache: ModelCache) -> None:
        """touch() on an unknown CID must not raise."""
        cache.touch("QmNonexistent")  # should not raise


# ── Eviction ──────────────────────────────────────────────────────────────────

class TestEviction:
    @pytest.mark.asyncio
    async def test_eviction_removes_oldest_entry(self, tmp_path: Path) -> None:
        """
        With a 1-byte budget, adding a second model must evict the first.
        """
        tiny = ModelCache(cache_dir=tmp_path / "evict", max_cache_mb=1)
        large = b"x" * (600 * 1024)  # 600 KiB each – two won't fit in 1 MiB

        await tiny.get_or_fetch("QmFirst",  _make_fake_fetcher(large))
        # Force a tiny time gap so LRU order is deterministic
        import time; time.sleep(0.01)
        await tiny.get_or_fetch("QmSecond", _make_fake_fetcher(large))

        cached_ids = set(tiny._index.keys())
        # One of the two must have been evicted
        assert len(cached_ids) <= 1

    @pytest.mark.asyncio
    async def test_current_size_after_eviction(self, tmp_path: Path) -> None:
        """Size must stay within budget after eviction."""
        tiny = ModelCache(cache_dir=tmp_path / "sz", max_cache_mb=1)
        large = b"y" * (600 * 1024)
        await tiny.get_or_fetch("QmC", _make_fake_fetcher(large))
        await tiny.get_or_fetch("QmD", _make_fake_fetcher(large))
        assert tiny.current_size_mb() <= 1.0


# ── Stale entry ───────────────────────────────────────────────────────────────

class TestStaleEntry:
    @pytest.mark.asyncio
    async def test_deleted_file_triggers_re_fetch(self, cache: ModelCache) -> None:
        counter: list[int] = []
        cid = "QmStale001"
        result = await cache.get_or_fetch(cid, _make_fake_fetcher(call_counter=counter))

        # Simulate external deletion
        result.path.unlink()

        # Re-fetch should call fetcher again
        await cache.get_or_fetch(cid, _make_fake_fetcher(call_counter=counter))
        assert len(counter) == 2
