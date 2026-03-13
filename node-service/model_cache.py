"""
model_cache.py – File-based LRU model cache for ModelVerse node-service.

Cache key: IPFS CID.
File path convention: <cache_dir>/<cid>.onnx

On startup, the directory is scanned and existing .onnx files are
re-registered in the in-memory index.  Eviction is LRU by last_accessed.
"""

from __future__ import annotations

import os
import tempfile
import time
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from logger import get_logger
from utils import ensure_dir

_log = get_logger(__name__)

# ── Data model ────────────────────────────────────────────────────────────────


@dataclass
class CachedModel:
    """Metadata for a single cached ONNX model file."""

    cid: str                   # IPFS CID used as the cache key
    path: Path                 # Absolute path to the .onnx file on disk
    size_bytes: int            # File size in bytes at time of registration
    last_accessed: datetime    # UTC timestamp of most-recent access

    @property
    def size_mb(self) -> float:
        return self.size_bytes / (1024 * 1024)


# ── Cache manager ─────────────────────────────────────────────────────────────


class ModelCache:
    """
    Async-capable, file-backed LRU cache for ONNX model files.

    Args:
        cache_dir:    Directory where model files are stored.
        max_cache_mb: Hard limit on combined file size in MiB.
    """

    def __init__(self, cache_dir: Path, max_cache_mb: int) -> None:
        self._dir: Path = ensure_dir(cache_dir)
        self._max_bytes: int = max_cache_mb * 1024 * 1024
        self._index: dict[str, CachedModel] = {}

        _log.info(
            "ModelCache initialised – dir=%s budget=%d MiB",
            self._dir, max_cache_mb,
        )
        self._scan_existing()

    # ── Public API ────────────────────────────────────────────────────────────

    async def get_or_fetch(
        self,
        cid: str,
        fetcher: Callable[[str], Awaitable[bytes]],
    ) -> CachedModel:
        """
        Return the cached model for *cid*, downloading it first if absent.

        Args:
            cid:     IPFS Content Identifier.
            fetcher: Async callable ``(cid) -> bytes`` – called only on miss.

        Returns:
            :class:`CachedModel` metadata (path, size, last_accessed).
        """
        # ── Cache hit ─────────────────────────────────────────────────────────
        if cid in self._index:
            entry = self._index[cid]
            if entry.path.exists():
                self.touch(cid)
                _log.debug("Cache HIT  – cid=%s", cid)
                return self._index[cid]
            # Stale reference (file deleted externally)
            _log.warning("Stale cache entry for cid=%s – will re-fetch.", cid)
            del self._index[cid]

        # ── Cache miss: download ───────────────────────────────────────────────
        _log.info("Cache MISS – fetching cid=%s", cid)
        raw_bytes: bytes = await fetcher(cid)

        target_path: Path = self._dir / f"{cid}.onnx"
        self._write_atomic(target_path, raw_bytes)

        entry = CachedModel(
            cid=cid,
            path=target_path.resolve(),
            size_bytes=len(raw_bytes),
            last_accessed=_utcnow(),
        )
        self._index[cid] = entry
        _log.info(
            "Cached model cid=%s size=%.2f MiB → %s",
            cid, entry.size_mb, target_path,
        )

        self.evict_if_needed()
        return entry

    def touch(self, cid: str) -> None:
        """Update the ``last_accessed`` timestamp for *cid* (if present)."""
        if cid in self._index:
            self._index[cid].last_accessed = _utcnow()

    def current_size_mb(self) -> float:
        """Return the total size of all cached files in MiB."""
        return sum(e.size_bytes for e in self._index.values()) / (1024 * 1024)

    def evict_if_needed(self) -> None:
        """Evict least-recently-used models until total size ≤ max_cache_mb."""
        current_bytes = sum(e.size_bytes for e in self._index.values())
        if current_bytes <= self._max_bytes:
            return

        # Sort ascending by last_accessed (oldest = evict first)
        lru_order = sorted(self._index.values(), key=lambda e: e.last_accessed)
        for entry in lru_order:
            if current_bytes <= self._max_bytes:
                break
            _log.info(
                "Evicting cid=%s (%.2f MiB) to meet budget.",
                entry.cid, entry.size_mb,
            )
            try:
                entry.path.unlink(missing_ok=True)
            except OSError as exc:
                _log.warning("Could not delete %s: %s", entry.path, exc)
            current_bytes -= entry.size_bytes
            del self._index[entry.cid]

    # ── Internals ─────────────────────────────────────────────────────────────

    def _scan_existing(self) -> None:
        """Populate the index from .onnx files already on disk."""
        count = 0
        for model_file in sorted(self._dir.glob("*.onnx")):
            cid = model_file.stem
            entry = CachedModel(
                cid=cid,
                path=model_file.resolve(),
                size_bytes=model_file.stat().st_size,
                last_accessed=_utcnow(),
            )
            self._index[cid] = entry
            count += 1
            _log.debug("Discovered cached model cid=%s (%.2f MiB)", cid, entry.size_mb)

        _log.info(
            "Cache scan complete – %d model(s), %.2f MiB used",
            count, self.current_size_mb(),
        )

    @staticmethod
    def _write_atomic(dest: Path, data: bytes) -> None:
        """Write *data* to *dest* atomically using a sibling temp file."""
        parent = dest.parent
        fd, tmp_path = tempfile.mkstemp(dir=parent, suffix=".tmp")
        try:
            with os.fdopen(fd, "wb") as fh:
                fh.write(data)
            # Atomic rename (POSIX) / best-effort on Windows
            Path(tmp_path).replace(dest)
        except Exception:
            # Clean up temp file on failure
            try:
                Path(tmp_path).unlink(missing_ok=True)
            except OSError:
                pass
            raise


# ── Helpers ───────────────────────────────────────────────────────────────────


def _utcnow() -> datetime:
    return datetime.now(tz=timezone.utc)


def build_model_cache() -> ModelCache:
    """
    Construct a :class:`ModelCache` from environment variables.

    Reads ``MODEL_CACHE_DIR`` (default ``./models_cache``) and
    ``max_model_cache_mb`` from the node config if available, or defaults
    to 2048 MiB.
    """
    cache_dir = Path(os.getenv("MODEL_CACHE_DIR", "./models_cache"))
    # Attempt to read YAML config; fall back to 2048 MiB if unavailable.
    try:
        from utils import load_config
        cfg = load_config()
        max_mb: int = int(cfg.get("performance", {}).get("max_model_cache_mb", 2048))
    except Exception:  # noqa: BLE001
        max_mb = 2048
    return ModelCache(cache_dir=cache_dir, max_cache_mb=max_mb)
