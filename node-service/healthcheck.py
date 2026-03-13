"""healthcheck.py - Runtime checks for cache and IPFS connectivity."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

from ipfs_client import check_ipfs_gateway as _check_ipfs_gateway
from logger import get_logger
from utils import ensure_dir

_log = get_logger(__name__)

def _check_cache_dir_exists(cache_dir: str) -> bool:
    try:
        resolved: Path = ensure_dir(cache_dir)
        _log.info("[healthcheck] OK   – MODEL_CACHE_DIR: %s", resolved.resolve())
        return True
    except OSError as exc:
        _log.error(
            "[healthcheck] FAIL – Cannot create MODEL_CACHE_DIR '%s': %s",
            cache_dir, exc,
        )
        return False


def _check_cache_dir_writable(cache_dir: str) -> bool:
    """Verify cache dir is writable by creating and deleting a temp file."""
    cache_path = Path(cache_dir)
    try:
        fd, tmp_path = tempfile.mkstemp(dir=cache_path, prefix=".hc_write_test_")
        os.close(fd)
        Path(tmp_path).unlink(missing_ok=True)
        _log.info("[healthcheck] OK   – MODEL_CACHE_DIR is writable.")
        return True
    except OSError as exc:
        _log.error(
            "[healthcheck] FAIL – MODEL_CACHE_DIR '%s' is NOT writable: %s",
            cache_dir, exc,
        )
        return False


async def check_ipfs_gateway() -> bool:
    """Probe the configured IPFS gateway and log success/failure."""
    ok = await _check_ipfs_gateway()
    if ok:
        _log.info("[healthcheck] OK   - IPFS gateway is reachable")
    else:
        _log.warning("[healthcheck] WARN - IPFS gateway is unreachable")
    return ok


def run_healthcheck(*, check_ipfs: bool = False) -> bool:
    """Run local cache checks and optionally probe the IPFS gateway."""
    _log.info("Running pre-flight healthcheck …")
    results: list[bool] = []

    cache_dir: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")
    dir_ok = _check_cache_dir_exists(cache_dir)
    results.append(dir_ok)
    if dir_ok:
        results.append(_check_cache_dir_writable(cache_dir))

    all_ok: bool = all(results)

    if check_ipfs:
        try:
            import asyncio

            asyncio.run(check_ipfs_gateway())
        except RuntimeError:
            _log.debug("Skipping IPFS probe: event loop already running")

    if all_ok:
        _log.info("Pre-flight healthcheck PASSED ✔")
    else:
        _log.warning("Pre-flight healthcheck finished with errors")

    return all_ok


if __name__ == "__main__":
    ok = run_healthcheck(check_ipfs=True)
    if ok:
        print("Healthcheck PASSED")
    else:
        print("Healthcheck FAILED")
        raise SystemExit(1)
