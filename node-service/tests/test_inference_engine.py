"""
tests/test_inference_engine.py – Unit tests for the ONNX InferenceEngine.

All tests monkeypatch onnxruntime and ModelCache so no real .onnx files
or IPFS network calls are required.

  * test_run_inference_dummy_session   – monkeypatched session returns fixed output.
  * test_session_cache_hit             – second load_session reuses the same object.
  * test_session_lru_eviction          – max_sessions=1 causes oldest to be dropped.
  * test_model_load_error_propagates   – ort.InferenceSession raising → ModelLoadError.
  * test_inference_error_propagates    – session.run raising → InferenceError.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pytest

from inference_engine import InferenceEngine, InferenceError, ModelLoadError
from model_cache import CachedModel, ModelCache


# ── Shared fixtures ───────────────────────────────────────────────────────────

def _utc_now():
    from datetime import datetime, timezone
    return datetime.now(tz=timezone.utc)


def _fake_cached_model(tmp_path: Path, cid: str = "QmFakeModel") -> CachedModel:
    """Create a tiny stub .onnx file and return a CachedModel pointing at it."""
    p = tmp_path / f"{cid}.onnx"
    p.write_bytes(b"not-real-onnx")
    return CachedModel(cid=cid, path=p, size_bytes=len(b"not-real-onnx"), last_accessed=_utc_now())


def _make_mock_cache(tmp_path: Path, cid: str = "QmFakeModel") -> MagicMock:
    """Return a MagicMock ModelCache whose get_or_fetch returns a fake CachedModel."""
    fake = _fake_cached_model(tmp_path, cid)
    mock_cache = MagicMock(spec=ModelCache)
    mock_cache.get_or_fetch = AsyncMock(return_value=fake)
    return mock_cache


class _FakeSession:
    """Minimal ort.InferenceSession stand-in that records calls."""

    def __init__(self, model_path: str, **kwargs: Any) -> None:
        self.model_path = model_path
        self._outputs = [MagicMock(name="output_0")]

    def get_outputs(self):
        return self._outputs

    def run(self, output_names, input_feed):
        return [np.array([0.42], dtype=np.float32)]


# ── Tests ─────────────────────────────────────────────────────────────────────

class TestRunInferenceDummySession:
    @pytest.mark.asyncio
    async def test_returns_output_dict(self, tmp_path: Path) -> None:
        """run_inference should return a dict keyed by output node name."""
        cid = "QmDummy001"
        mock_cache = _make_mock_cache(tmp_path, cid)

        with patch("inference_engine.ort.InferenceSession", _FakeSession):
            engine = InferenceEngine(cache=mock_cache, max_sessions=3)
            result = await engine.run_inference(
                cid, {"input_0": np.zeros((1, 4), dtype=np.float32)}
            )

        assert isinstance(result, dict)
        assert len(result) == 1
        key = next(iter(result))
        assert isinstance(result[key], np.ndarray)

    @pytest.mark.asyncio
    async def test_cache_get_or_fetch_called_once(self, tmp_path: Path) -> None:
        """load_session should call get_or_fetch exactly once per cache miss."""
        cid = "QmDummy002"
        mock_cache = _make_mock_cache(tmp_path, cid)

        with patch("inference_engine.ort.InferenceSession", _FakeSession):
            engine = InferenceEngine(cache=mock_cache, max_sessions=3)
            await engine.run_inference(cid, {})

        mock_cache.get_or_fetch.assert_called_once()


class TestSessionCacheHit:
    @pytest.mark.asyncio
    async def test_second_call_reuses_session_object(self, tmp_path: Path) -> None:
        """Two load_session calls for the same CID must return the same session object."""
        cid = "QmSession001"
        mock_cache = _make_mock_cache(tmp_path, cid)

        with patch("inference_engine.ort.InferenceSession", _FakeSession):
            engine = InferenceEngine(cache=mock_cache, max_sessions=3)
            sess1 = await engine.load_session(cid)
            sess2 = await engine.load_session(cid)

        assert sess1 is sess2, "Session should be reused on second load_session call"

    @pytest.mark.asyncio
    async def test_session_cache_hit_skips_get_or_fetch(self, tmp_path: Path) -> None:
        """On a session cache hit, get_or_fetch must NOT be called again."""
        cid = "QmSession002"
        mock_cache = _make_mock_cache(tmp_path, cid)

        with patch("inference_engine.ort.InferenceSession", _FakeSession):
            engine = InferenceEngine(cache=mock_cache, max_sessions=3)
            await engine.load_session(cid)  # miss
            await engine.load_session(cid)  # hit

        mock_cache.get_or_fetch.assert_called_once()


class TestSessionLRUEviction:
    @pytest.mark.asyncio
    async def test_lru_evicts_oldest_session(self, tmp_path: Path) -> None:
        """With max_sessions=1, loading a second CID should evict the first."""
        cid_a, cid_b = "QmLRU_A", "QmLRU_B"

        def _cache_for(cid: str) -> MagicMock:
            return _make_mock_cache(tmp_path, cid)

        # Use a single engine with one cache that handles both CIDs
        fake_a = _fake_cached_model(tmp_path, cid_a)
        fake_b = _fake_cached_model(tmp_path, cid_b)

        mock_cache = MagicMock(spec=ModelCache)
        mock_cache.get_or_fetch = AsyncMock(side_effect=[fake_a, fake_b])

        with patch("inference_engine.ort.InferenceSession", _FakeSession):
            engine = InferenceEngine(cache=mock_cache, max_sessions=1)
            await engine.load_session(cid_a)
            await engine.load_session(cid_b)

        # Only cid_b should remain in the session cache
        assert cid_b in engine._sessions
        assert cid_a not in engine._sessions


class TestErrorPropagation:
    @pytest.mark.asyncio
    async def test_model_load_error_on_bad_onnx(self, tmp_path: Path) -> None:
        """If ort.InferenceSession raises, InferenceEngine must raise ModelLoadError."""
        cid = "QmBadModel"
        mock_cache = _make_mock_cache(tmp_path, cid)

        def _bad_session(path, **kwargs):
            raise RuntimeError("Corrupt ONNX graph")

        with patch("inference_engine.ort.InferenceSession", _bad_session):
            engine = InferenceEngine(cache=mock_cache, max_sessions=3)
            with pytest.raises(ModelLoadError, match="ONNX session creation failed"):
                await engine.load_session(cid)

    @pytest.mark.asyncio
    async def test_inference_error_on_run_failure(self, tmp_path: Path) -> None:
        """If session.run raises, InferenceEngine must raise InferenceError."""
        cid = "QmRunFail"
        mock_cache = _make_mock_cache(tmp_path, cid)

        class _CrashingSession(_FakeSession):
            def run(self, output_names, input_feed):
                raise ValueError("shape mismatch")

        with patch("inference_engine.ort.InferenceSession", _CrashingSession):
            engine = InferenceEngine(cache=mock_cache, max_sessions=3)
            with pytest.raises(InferenceError, match="Inference failed"):
                await engine.run_inference(cid, {"x": np.zeros((1, 4))})
