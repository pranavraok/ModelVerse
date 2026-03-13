from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pytest
from PIL import Image

from inference_engine import InferenceEngine
from model_cache import CachedModel, ModelCache


class _FakeInput:
    def __init__(self, name: str, shape: tuple[int, int, int, int]) -> None:
        self.name = name
        self.shape = shape


class _FakeOutput:
    def __init__(self, name: str) -> None:
        self.name = name


class _FakeSession:
    constructor_calls = 0
    last_input_feed: dict[str, np.ndarray] | None = None

    def __init__(self, model_path: str, providers: list[str]) -> None:
        _FakeSession.constructor_calls += 1
        self.model_path = model_path
        self.providers = providers

    def get_inputs(self) -> list[_FakeInput]:
        return [_FakeInput("input", (1, 3, 224, 224))]

    def get_outputs(self) -> list[_FakeOutput]:
        return [_FakeOutput("output")]

    def run(self, _, input_feed: dict[str, np.ndarray]) -> list[np.ndarray]:
        _FakeSession.last_input_feed = input_feed
        return [np.array([[0.1, 1.0]], dtype=np.float32)]


def _patch_cache(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    fake_path = tmp_path / "fake.onnx"
    fake_path.write_bytes(b"dummy")

    async def fake_get_or_fetch(self: ModelCache, cid: str, fetcher):
        _ = fetcher
        return CachedModel(
            cid=cid,
            path=fake_path,
            size_bytes=fake_path.stat().st_size,
            last_accessed=datetime.now(timezone.utc),
        )

    monkeypatch.setattr(ModelCache, "get_or_fetch", fake_get_or_fetch)


@pytest.mark.asyncio
async def test_classify_image_preprocess_and_topk(
    monkeypatch: pytest.MonkeyPatch,
    tmp_path: Path,
) -> None:
    _FakeSession.constructor_calls = 0
    _FakeSession.last_input_feed = None
    monkeypatch.setattr("inference_engine.ort.InferenceSession", _FakeSession)
    _patch_cache(monkeypatch, tmp_path)

    cache = ModelCache(cache_dir=tmp_path / "cache", max_cache_mb=10)
    engine = InferenceEngine(cache=cache)

    image = Image.new("RGB", (512, 512), color="red")
    result = await engine.classify_image(
        cid="dummy",
        image=image,
        input_name="input",
        top_k=2,
    )

    assert len(result) == 2
    assert result[0][0] == 1
    assert result[0][1] >= result[1][1]
    prob_sum = float(np.sum(np.array([prob for _, prob in result], dtype=np.float32)))
    assert np.isclose(prob_sum, 1.0, atol=1e-6)
    assert _FakeSession.last_input_feed is not None
    assert _FakeSession.last_input_feed["input"].shape == (1, 3, 224, 224)


@pytest.mark.asyncio
async def test_inference_uses_session_cache(monkeypatch: pytest.MonkeyPatch, tmp_path: Path) -> None:
    _FakeSession.constructor_calls = 0
    monkeypatch.setattr("inference_engine.ort.InferenceSession", _FakeSession)
    _patch_cache(monkeypatch, tmp_path)

    cache = ModelCache(cache_dir=tmp_path / "cache2", max_cache_mb=10)
    engine = InferenceEngine(cache=cache)

    feed = {"input": np.zeros((1, 3, 224, 224), dtype=np.float32)}
    await engine.run_inference("dummy-cid", feed)
    await engine.run_inference("dummy-cid", feed)

    assert _FakeSession.constructor_calls == 1
