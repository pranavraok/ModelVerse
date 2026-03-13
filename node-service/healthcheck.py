"""
healthcheck.py – Pre-flight sanity checks for the ModelVerse node daemon.

Run ``run_healthcheck()`` once at startup to verify the environment is
correctly configured before the daemon enters its main loop.

Checks:
  1. RPC_URL is set.
  2. NODE_PRIVATE_KEY is present and the correct length.
  3. MODEL_CACHE_DIR exists (created if missing).
  4. MODEL_CACHE_DIR is writable (temp-file probe).
  5. IPFS gateway is reachable (optional, async; surfaced as warning only).
"""

from __future__ import annotations

import asyncio
import os
import tempfile
from pathlib import Path

from logger import get_logger
from utils import ensure_dir

_log = get_logger(__name__)

_MIN_KEY_LENGTH_NO_PREFIX: int = 64


# ── Individual check helpers ──────────────────────────────────────────────────


def _check_rpc_url() -> bool:
    rpc_url: str | None = os.getenv("RPC_URL")
    if not rpc_url:
        _log.error(
            "[healthcheck] FAIL – RPC_URL is not set. "
            "Add it to your .env (e.g. Alchemy/Infura endpoint)."
        )
        return False
    _log.info("[healthcheck] OK   – RPC_URL: %s", rpc_url)
    return True


def _check_private_key() -> bool:
    private_key: str | None = os.getenv("NODE_PRIVATE_KEY")
    if not private_key:
        _log.error(
            "[healthcheck] FAIL – NODE_PRIVATE_KEY is not set. "
            "Export your wallet private key as a 64-char hex string."
        )
        return False
    stripped = private_key.removeprefix("0x")
    if len(stripped) != _MIN_KEY_LENGTH_NO_PREFIX:
        _log.error(
            "[healthcheck] FAIL – NODE_PRIVATE_KEY wrong length: got %d, expected %d.",
            len(stripped), _MIN_KEY_LENGTH_NO_PREFIX,
        )
        return False
    _log.info("[healthcheck] OK   – NODE_PRIVATE_KEY length correct (%d chars).", len(stripped))
    return True


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
    """Verify the cache directory is writable by creating and deleting a temp file."""
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
    """
    Probe the primary IPFS gateway and log the result.

    Returns:
        ``True`` if reachable, ``False`` otherwise.
        Failure is logged as a *warning* (not a hard error) so the daemon
        can still start if IPFS is temporarily slow.
    """
    try:
        from ipfs_client import check_ipfs_gateway as _probe  # avoid circular at module level
        ok = await _probe()
    except Exception as exc:  # noqa: BLE001
        _log.warning("[healthcheck] Could not probe IPFS gateway: %s", exc)
        return False
    if ok:
        _log.info("[healthcheck] OK   – IPFS gateway is reachable.")
    else:
        _log.warning(
            "[healthcheck] WARN – IPFS gateway unreachable. "
            "Model downloads will fail until connectivity is restored."
        )
    return ok


# ── Main healthcheck ──────────────────────────────────────────────────────────


def run_healthcheck(*, check_ipfs: bool = False) -> bool:
    """
    Run all pre-flight checks synchronously.

    Args:
        check_ipfs: When ``True``, also probe the IPFS gateway (async,
                    run via ``asyncio.run``).  Defaults to ``False`` so the
                    daemon can start without blocking on network latency.

    Returns:
        ``True`` if all *required* checks passed, ``False`` otherwise.
        IPFS gateway reachability is a soft check (warning only).
    """
    _log.info("Running pre-flight healthcheck …")
    results: list[bool] = []

    # ── Required checks ───────────────────────────────────────────────────────
    results.append(_check_rpc_url())
    results.append(_check_private_key())

    cache_dir: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")
    dir_ok = _check_cache_dir_exists(cache_dir)
    results.append(dir_ok)
    if dir_ok:
        results.append(_check_cache_dir_writable(cache_dir))

    all_ok: bool = all(results)

    # ── Optional IPFS probe ───────────────────────────────────────────────────
    if check_ipfs:
        try:
            asyncio.run(check_ipfs_gateway())
        except RuntimeError:
            # Already inside a running event loop (e.g., during tests) — skip.
            _log.debug("Skipping async IPFS probe (already in event loop).")

    # ── Summary ───────────────────────────────────────────────────────────────
    if all_ok:
        _log.info("Pre-flight healthcheck PASSED ✔")
    else:
        _log.warning(
            "Pre-flight healthcheck finished with errors. "
            "Fix your .env configuration and retry."
        )

    return all_ok
