"""
ipfs_client.py – Async IPFS HTTP gateway client for ModelVerse node-service.

Supports:
  - Single gateway via IPFS_GATEWAY env var.
  - Fallback list via IPFS_GATEWAYS (comma-separated); cycled on failure.
  - Up to 3 attempts per gateway with exponential backoff (1s, 2s, 4s).
  - Shared logger from logger.py.
"""

from __future__ import annotations

import asyncio
import json
import os
from typing import Sequence

import httpx

from logger import get_logger

_log = get_logger(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────

_MAX_ATTEMPTS_PER_GATEWAY: int = 3
_BACKOFF_BASE_SECONDS: float = 1.0   # delays: 1s, 2s, 4s


# ── Gateway resolution ────────────────────────────────────────────────────────

def _resolve_gateways() -> list[str]:
    """
    Build the ordered list of gateways to try.

    Priority:
      1. ``IPFS_GATEWAYS`` – comma-separated list (multi-gateway mode).
      2. ``IPFS_GATEWAY``  – single gateway URL.
      3. Hard-coded default: ``https://ipfs.io/ipfs``.

    All entries are stripped of trailing slashes.
    """
    multi: str | None = os.getenv("IPFS_GATEWAYS")
    if multi:
        gateways = [g.strip().rstrip("/") for g in multi.split(",") if g.strip()]
        if gateways:
            return gateways

    single: str = os.getenv("IPFS_GATEWAY", "https://ipfs.io/ipfs").rstrip("/")
    return [single]


# ── Core fetch ────────────────────────────────────────────────────────────────

class IPFSFetchError(Exception):
    """Raised when all gateways have been exhausted without success."""


async def fetch_ipfs_file(cid: str, timeout: float = 60.0) -> bytes:
    """
    Download the raw bytes for *cid* from the configured IPFS gateway(s).

    Tries each gateway up to ``_MAX_ATTEMPTS_PER_GATEWAY`` times with
    exponential backoff before moving to the next gateway.  All gateways
    are exhausted before raising :class:`IPFSFetchError`.

    Args:
        cid:     IPFS Content Identifier, e.g. ``QmXyz…``.
        timeout: Per-request HTTP timeout in seconds (default 60 s).

    Returns:
        Raw bytes of the downloaded content.

    Raises:
        IPFSFetchError: If every gateway / attempt combination fails.
    """
    gateways: list[str] = _resolve_gateways()
    last_exc: Exception = RuntimeError("No gateways configured")

    for gateway in gateways:
        url = f"{gateway}/{cid}"
        for attempt in range(1, _MAX_ATTEMPTS_PER_GATEWAY + 1):
            _log.info(
                "IPFS fetch attempt %d/%d – gateway=%s cid=%s",
                attempt, _MAX_ATTEMPTS_PER_GATEWAY, gateway, cid,
            )
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(url)
                    response.raise_for_status()
                _log.info(
                    "IPFS fetch OK – gateway=%s cid=%s size=%d bytes",
                    gateway, cid, len(response.content),
                )
                return response.content

            except httpx.HTTPStatusError as exc:
                _log.warning(
                    "IPFS HTTP error (attempt %d) – gateway=%s status=%d: %s",
                    attempt, gateway, exc.response.status_code, exc,
                )
                last_exc = exc

            except httpx.TimeoutException as exc:
                _log.warning(
                    "IPFS timeout (attempt %d) – gateway=%s cid=%s: %s",
                    attempt, gateway, cid, exc,
                )
                last_exc = exc

            except httpx.RequestError as exc:
                _log.warning(
                    "IPFS request error (attempt %d) – gateway=%s: %s",
                    attempt, gateway, exc,
                )
                last_exc = exc

            # Exponential backoff – skip sleep after the last attempt
            if attempt < _MAX_ATTEMPTS_PER_GATEWAY:
                delay = _BACKOFF_BASE_SECONDS * (2 ** (attempt - 1))
                _log.debug("Backing off %.1fs before retry …", delay)
                await asyncio.sleep(delay)

        _log.error("All %d attempts failed for gateway %s – trying next gateway.", _MAX_ATTEMPTS_PER_GATEWAY, gateway)

    raise IPFSFetchError(
        f"Failed to fetch CID '{cid}' from all {len(gateways)} configured gateway(s). "
        f"Last error: {last_exc}"
    ) from last_exc


# ── Convenience wrappers ──────────────────────────────────────────────────────

async def fetch_json_from_ipfs(cid: str, timeout: float = 30.0) -> dict:
    """
    Fetch a JSON document from IPFS and parse it.

    Args:
        cid:     IPFS CID of the JSON file.
        timeout: HTTP timeout in seconds.

    Returns:
        Parsed content as a :class:`dict`.

    Raises:
        IPFSFetchError: On gateway exhaustion.
        json.JSONDecodeError: If the content is not valid JSON.
    """
    raw: bytes = await fetch_ipfs_file(cid, timeout=timeout)
    return json.loads(raw.decode("utf-8"))


async def check_ipfs_gateway(timeout: float = 10.0) -> bool:
    """
    Probe the primary gateway with a lightweight HEAD request.

    Used by the healthcheck to verify IPFS reachability without
    downloading any content.

    Args:
        timeout: HTTP timeout in seconds.

    Returns:
        ``True`` if the gateway responded (any HTTP status), ``False`` on
        connection/timeout errors.
    """
    gateways: list[str] = _resolve_gateways()
    primary: str = gateways[0]
    # Use the gateway base URL (no CID) – most gateways return a redirect or
    # 400/404 which still proves the host is reachable.
    probe_url = primary.rstrip("/ipfs").rstrip("/")
    _log.debug("IPFS gateway probe – url=%s", probe_url)
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.head(probe_url)
        _log.info(
            "[healthcheck] IPFS gateway reachable – %s (HTTP %d)",
            probe_url, response.status_code,
        )
        return True
    except Exception as exc:  # noqa: BLE001
        _log.warning("[healthcheck] IPFS gateway unreachable – %s: %s", probe_url, exc)
        return False
