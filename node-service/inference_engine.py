from __future__ import annotations

import time
from collections import OrderedDict
from collections.abc import Sequence
from typing import Literal

import numpy as np
import onnxruntime as ort
from PIL import Image, ImageOps

from ipfs_client import fetch_ipfs_file
from logger import get_logger
from model_cache import ModelCache

_log = get_logger(__name__)


class ModelLoadError(Exception):
    """Raised when a model cannot be loaded into ONNX Runtime."""


class InferenceError(Exception):
    """Raised when ONNX Runtime execution fails."""


class InferenceEngine:
    def __init__(self, cache: ModelCache) -> None:
        self.cache = cache
        self._max_sessions = 4
        self._sessions: OrderedDict[str, ort.InferenceSession] = OrderedDict()

    async def load_session(self, cid: str) -> ort.InferenceSession:
        cached_session = self._sessions.get(cid)
        if cached_session is not None:
            self._sessions.move_to_end(cid)
            return cached_session

        cached_model = await self.cache.get_or_fetch(cid, fetcher=fetch_ipfs_file)
        _log.info("Loading ONNX model for CID %s from %s", cid, cached_model.path)

        try:
            session = ort.InferenceSession(
                str(cached_model.path),
                providers=["CPUExecutionProvider"],
            )
        except Exception as exc:
            _log.exception("Failed to create ONNX session for CID %s", cid)
            raise ModelLoadError(f"Failed to load model for CID {cid}: {exc}") from exc

        self._sessions[cid] = session
        self._sessions.move_to_end(cid)
        self._evict_session_if_needed()
        _log.info("ONNX session loaded for CID %s", cid)
        return session

    async def run_inference(self, cid: str, input_feed: dict[str, np.ndarray]) -> dict[str, np.ndarray]:
        session = await self.load_session(cid)
        output_names = [output.name for output in session.get_outputs()]

        _log.info("Inference started for CID %s", cid)
        start = time.perf_counter()
        try:
            values = session.run(output_names, input_feed)
        except Exception as exc:
            _log.exception("Inference failed for CID %s", cid)
            raise InferenceError(f"Inference failed for CID {cid}: {exc}") from exc

        elapsed_ms = (time.perf_counter() - start) * 1000
        _log.info("Inference completed for CID %s in %.2f ms", cid, elapsed_ms)
        return {name: value for name, value in zip(output_names, values)}

    async def classify_image(
        self,
        cid: str,
        image: Image.Image,
        input_name: str,
        input_size: tuple[int, int] = (224, 224),
        mean: tuple[float, float, float] | None = (0.485, 0.456, 0.406),
        std: tuple[float, float, float] | None = (0.229, 0.224, 0.225),
        top_k: int = 5,
    ) -> list[tuple[int, float]]:
        session = await self.load_session(cid)

        model_inputs = session.get_inputs()
        if not model_inputs:
            raise InferenceError("Model has no inputs")

        raw_shape = model_inputs[0].shape
        parsed_shape = _parse_input_shape(raw_shape)
        layout = _infer_layout_from_shape(parsed_shape)

        _log.info(
            "Preprocessing image for CID %s with layout=%s target_size=%s",
            cid,
            layout,
            input_size,
        )

        prepared = ImageOps.fit(
            image.convert("RGB"),
            input_size,
            method=Image.Resampling.BILINEAR,
            centering=(0.5, 0.5),
        )

        array = np.asarray(prepared, dtype=np.float32) / 255.0
        if mean is not None and std is not None:
            mean_arr = np.asarray(mean, dtype=np.float32).reshape((1, 1, 3))
            std_arr = np.asarray(std, dtype=np.float32).reshape((1, 1, 3))
            array = (array - mean_arr) / std_arr

        if layout == "NCHW":
            tensor = np.transpose(array, (2, 0, 1))[np.newaxis, ...]
        else:
            tensor = array[np.newaxis, ...]

        input_feed = {input_name: tensor.astype(np.float32)}
        start = time.perf_counter()
        try:
            outputs = session.run(None, input_feed)
        except Exception as exc:
            _log.exception("Image classification failed for CID %s", cid)
            raise InferenceError(f"Image classification failed for CID {cid}: {exc}") from exc

        elapsed_ms = (time.perf_counter() - start) * 1000
        if not outputs:
            raise InferenceError("Model produced no outputs")

        logits = np.asarray(outputs[0], dtype=np.float32)
        if logits.ndim == 1:
            logits = logits[np.newaxis, :]
        if logits.ndim != 2:
            raise InferenceError(f"Expected logits shape (1, N), got {logits.shape}")

        probabilities = _softmax(logits, axis=1)[0]
        k = max(1, min(top_k, probabilities.shape[0]))
        top_indices = np.argsort(probabilities)[::-1][:k]
        results = [(int(index), float(probabilities[index])) for index in top_indices]

        _log.info(
            "Image classification complete for CID %s in %.2f ms; top_k_indices=%s",
            cid,
            elapsed_ms,
            [idx for idx, _ in results],
        )
        return results

    def _evict_session_if_needed(self) -> None:
        while len(self._sessions) > self._max_sessions:
            evicted_cid, _ = self._sessions.popitem(last=False)
            _log.info("Evicted ONNX session for CID %s", evicted_cid)


def _infer_layout_from_shape(shape: Sequence[int]) -> Literal["NCHW", "NHWC"]:
    if len(shape) >= 4:
        if shape[1] == 3:
            return "NCHW"
        if shape[-1] == 3:
            return "NHWC"
    return "NCHW"


def _softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    shifted = x - np.max(x, axis=axis, keepdims=True)
    exp = np.exp(shifted)
    return exp / np.sum(exp, axis=axis, keepdims=True)


def _parse_input_shape(shape: Sequence[object]) -> list[int]:
    parsed: list[int] = []
    for value in shape:
        if isinstance(value, int):
            parsed.append(value)
        else:
            parsed.append(-1)
    return parsed
