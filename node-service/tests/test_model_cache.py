from __future__ import annotations

import time
from pathlib import Path

import pytest

from model_cache import ModelCache


@pytest.mark.asyncio
async def test_model_cache_local_roundtrip(tmp_path: Path) -> None:
    cache = ModelCache(cache_dir=tmp_path / "cache", max_cache_mb=1)
    cid = "QmDummyModel"
    counter = {"calls": 0}

    async def fake_fetcher(_: str) -> bytes:
        counter["calls"] += 1
        return b"dummy-model"

    first = await cache.get_or_fetch(cid, fake_fetcher)
    assert first.path.exists()

    second = await cache.get_or_fetch(cid, fake_fetcher)
    assert second.path == first.path
    assert counter["calls"] == 1


@pytest.mark.asyncio
async def test_model_cache_eviction_lru(tmp_path: Path) -> None:
    cache = ModelCache(cache_dir=tmp_path / "cache_lru", max_cache_mb=1)

    async def large_fetcher_a(_: str) -> bytes:
        return b"a" * (700 * 1024)

    async def large_fetcher_b(_: str) -> bytes:
        return b"b" * (700 * 1024)

    await cache.get_or_fetch("cid-old", large_fetcher_a)
    # Ensure deterministic access order for LRU eviction.
    time.sleep(0.02)
    await cache.get_or_fetch("cid-new", large_fetcher_b)

    assert "cid-new" in cache._index
    assert "cid-old" not in cache._index
    assert cache.current_size_mb() <= 1.0
