"""
inference_engine.py – ONNX Runtime inference engine for ModelVerse node-service.

Wires together ModelCache + ipfs_client.fetch_ipfs_file + onnxruntime to:
  1. Ensure the model .onnx file is locally cached (download via IPFS if not).
  2. Load it into an ort.InferenceSession (with a small LRU in-memory cache).
  3. Run inference and return a typed result dict.

Custom exceptions:
  - ModelLoadError   – raised when ONNX session creation fails.
  - InferenceError   – raised when session.run() fails.
"""

from __future__ import annotations

import time
from collections import OrderedDict

import numpy as np
import onnxruntime as ort  # type: ignore[import]

from ipfs_client import fetch_ipfs_file
from logger import get_logger
from model_cache import CachedModel, ModelCache

_log = get_logger(__name__)
_log.debug("onnxruntime version: %s", ort.__version__)


# ── Custom exceptions ─────────────────────────────────────────────────────────


class ModelLoadError(Exception):
    """Raised when an ONNX model cannot be loaded into an InferenceSession."""


class InferenceError(Exception):
    """Raised when onnxruntime session.run() fails."""


# ── Inference engine ──────────────────────────────────────────────────────────


class InferenceEngine:
    """
    Manages ONNX InferenceSession objects for multiple models.

    Sessions are cached in-memory (LRU, bounded by *max_sessions*) to
    avoid the overhead of re-loading the ONNX graph on every job.

    Args:
        cache:        A :class:`ModelCache` instance for local file storage.
        max_sessions: Maximum number of simultaneous live ONNX sessions.
    """

    def __init__(self, cache: ModelCache, max_sessions: int = 3) -> None:
        self._cache = cache
        self._max_sessions = max_sessions
        # OrderedDict used as a simple LRU: most-recently-used at the end.
        self._sessions: OrderedDict[str, ort.InferenceSession] = OrderedDict()
        _log.info("InferenceEngine ready – max_sessions=%d", max_sessions)

    # ── Public API ────────────────────────────────────────────────────────────

    async def load_session(self, cid: str) -> ort.InferenceSession:
        """
        Return a live ONNX session for the model identified by *cid*.

        Checks the in-memory session cache first.  On a miss, fetches the
        .onnx file via :class:`ModelCache` (which in turn calls
        :func:`fetch_ipfs_file` if the file is absent), then instantiates
        a new session with the CPU execution provider.

        Args:
            cid: IPFS CID of the ONNX model file.

        Returns:
            An ``onnxruntime.InferenceSession`` ready for inference.

        Raises:
            ModelLoadError: If onnxruntime cannot parse the model file.
        """
        # ── Session cache hit ─────────────────────────────────────────────────
        if cid in self._sessions:
            # Move to end → mark as most-recently-used
            self._sessions.move_to_end(cid)
            _log.debug("Session cache HIT – cid=%s", cid)
            return self._sessions[cid]

        # ── Ensure model file is on disk ──────────────────────────────────────
        cached: CachedModel = await self._cache.get_or_fetch(
            cid, fetcher=fetch_ipfs_file
        )

        # ── Load ONNX session ─────────────────────────────────────────────────
        _log.info("Loading ONNX session – cid=%s path=%s", cid, cached.path)
        opts = ort.SessionOptions()
        opts.log_severity_level = 3  # suppress verbose ORT logs
        try:
            session = ort.InferenceSession(
                str(cached.path),
                sess_options=opts,
                providers=["CPUExecutionProvider"],
            )
        except Exception as exc:
            _log.error("Failed to load ONNX model cid=%s: %s", cid, exc)
            raise ModelLoadError(
                f"ONNX session creation failed for cid={cid!r}: {exc}"
            ) from exc

        _log.info("ONNX session loaded – cid=%s", cid)

        # ── Store with LRU eviction ───────────────────────────────────────────
        self._sessions[cid] = session
        self._sessions.move_to_end(cid)
        self._evict_sessions()

        return session

    async def run_inference(
        self,
        cid: str,
        input_feed: dict[str, np.ndarray],
    ) -> dict[str, np.ndarray]:
        """
        Run a full forward pass for the model identified by *cid*.

        Ensures the session is loaded (via :meth:`load_session`) then calls
        ``session.run()``.  Timing is logged at INFO level.

        Args:
            cid:        IPFS CID of the ONNX model.
            input_feed: Dict mapping ONNX input node names → numpy arrays.

        Returns:
            Dict mapping ONNX output node names → numpy arrays.

        Raises:
            ModelLoadError: If the session cannot be loaded.
            InferenceError: If ONNX runtime raises during execution.
        """
        session = await self.load_session(cid)
        output_names: list[str] = [out.name for out in session.get_outputs()]

        _log.info("Inference START – cid=%s inputs=%s", cid, list(input_feed.keys()))
        t_start = time.perf_counter()
        try:
            raw_outputs = session.run(output_names, input_feed)
        except Exception as exc:
            _log.error("Inference FAILED – cid=%s: %s", cid, exc)
            raise InferenceError(
                f"Inference failed for cid={cid!r}: {exc}"
            ) from exc

        latency_ms = (time.perf_counter() - t_start) * 1000
        _log.info(
            "Inference END – cid=%s latency=%.2f ms outputs=%s",
            cid, latency_ms, output_names,
        )

        return dict(zip(output_names, raw_outputs))

    # ── Internals ─────────────────────────────────────────────────────────────

    def _evict_sessions(self) -> None:
        """Remove the least-recently-used session when over the limit."""
        while len(self._sessions) > self._max_sessions:
            evicted_cid, _ = self._sessions.popitem(last=False)  # oldest
            _log.info("Session cache evicted – cid=%s", evicted_cid)
