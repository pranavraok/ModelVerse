from __future__ import annotations

import os
import tempfile
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

from logger import get_logger
from utils import ensure_dir

_log = get_logger(__name__)


@dataclass
class CachedModel:
    cid: str
    path: Path
    size_bytes: int
    last_accessed: datetime


class ModelCache:
    def __init__(self, cache_dir: Path, max_cache_mb: int) -> None:
        self.cache_dir = ensure_dir(cache_dir)
        self.max_cache_mb = max_cache_mb
        self._max_cache_bytes = max_cache_mb * 1024 * 1024
        self._index: dict[str, CachedModel] = {}
        self._load_existing()

    async def get_or_fetch(
        self,
        cid: str,
        fetcher: Callable[[str], Awaitable[bytes]],
    ) -> CachedModel:
        existing = self._index.get(cid)
        if existing is not None and existing.path.exists():
            self.touch(cid)
            return self._index[cid]

        if existing is not None and not existing.path.exists():
            self._index.pop(cid, None)

        model_bytes = await fetcher(cid)
        target_path = self.cache_dir / f"{cid}.onnx"
        self._write_atomic(target_path, model_bytes)

        cached = CachedModel(
            cid=cid,
            path=target_path,
            size_bytes=target_path.stat().st_size,
            last_accessed=_utc_now(),
        )
        self._index[cid] = cached
        self.evict_if_needed()
        return cached

    def touch(self, cid: str) -> None:
        cached = self._index.get(cid)
        if cached is None:
            return
        cached.last_accessed = _utc_now()

    def current_size_mb(self) -> float:
        total_bytes = sum(item.size_bytes for item in self._index.values())
        return total_bytes / (1024 * 1024)

    def evict_if_needed(self) -> None:
        total_bytes = sum(item.size_bytes for item in self._index.values())
        if total_bytes <= self._max_cache_bytes:
            return

        # Least recently used entries are evicted first.
        ordered = sorted(self._index.values(), key=lambda item: item.last_accessed)
        for entry in ordered:
            if total_bytes <= self._max_cache_bytes:
                break

            try:
                entry.path.unlink(missing_ok=True)
            except OSError as exc:
                _log.warning("Failed to remove cached model %s: %s", entry.path, exc)

            total_bytes -= entry.size_bytes
            self._index.pop(entry.cid, None)

    def _load_existing(self) -> None:
        for file_path in self.cache_dir.glob("*.onnx"):
            cid = file_path.stem
            self._index[cid] = CachedModel(
                cid=cid,
                path=file_path,
                size_bytes=file_path.stat().st_size,
                last_accessed=_utc_now(),
            )

    @staticmethod
    def _write_atomic(path: Path, content: bytes) -> None:
        fd, temp_path = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
        try:
            with os.fdopen(fd, "wb") as tmp_file:
                tmp_file.write(content)
            Path(temp_path).replace(path)
        except Exception:
            Path(temp_path).unlink(missing_ok=True)
            raise


def create_default_model_cache(max_cache_mb: int = 1024) -> ModelCache:
    cache_dir = Path(os.getenv("MODEL_CACHE_DIR", "./models_cache"))
    return ModelCache(cache_dir=cache_dir, max_cache_mb=max_cache_mb)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)
