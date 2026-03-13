from __future__ import annotations

import asyncio
import os

import httpx

from logger import get_logger

_log = get_logger(__name__)

_DEFAULT_GATEWAY = "https://ipfs.io/ipfs/"
_MAX_ATTEMPTS_PER_GATEWAY = 3


class IPFSFetchError(Exception):
    """Raised when all configured IPFS gateways fail."""


def _normalize_gateway(url: str) -> str:
    cleaned = url.strip()
    if not cleaned:
        return ""
    return cleaned.rstrip("/") + "/"


def _resolve_gateways() -> list[str]:
    gateways_env = os.getenv("IPFS_GATEWAYS", "").strip()
    if gateways_env:
        gateways = [_normalize_gateway(item) for item in gateways_env.split(",")]
        gateways = [item for item in gateways if item]
        if gateways:
            return gateways

    single = _normalize_gateway(os.getenv("IPFS_GATEWAY", _DEFAULT_GATEWAY))
    return [single or _DEFAULT_GATEWAY]


async def fetch_ipfs_file(cid: str, timeout: float = 60.0) -> bytes:
    """Download raw bytes for a given IPFS CID from configured gateway(s)."""
    gateways = _resolve_gateways()
    last_error: Exception | None = None

    for gateway in gateways:
        url = f"{gateway}{cid}"
        for attempt in range(1, _MAX_ATTEMPTS_PER_GATEWAY + 1):
            _log.info("Fetching CID %s from gateway %s (attempt %d)", cid, gateway, attempt)
            try:
                async with httpx.AsyncClient(timeout=timeout) as client:
                    response = await client.get(url)

                if response.status_code == 200:
                    _log.info("Fetched CID %s from %s (%d bytes)", cid, gateway, len(response.content))
                    return response.content

                error = IPFSFetchError(
                    f"Gateway {gateway} returned HTTP {response.status_code} for CID {cid}"
                )
                last_error = error
                _log.warning("%s", error)

            except (httpx.TimeoutException, httpx.RequestError) as exc:
                last_error = exc
                _log.warning(
                    "Gateway %s failed for CID %s on attempt %d: %s",
                    gateway,
                    cid,
                    attempt,
                    exc,
                )

            if attempt < _MAX_ATTEMPTS_PER_GATEWAY:
                delay = float(2 ** (attempt - 1))
                await asyncio.sleep(delay)

        _log.warning("Gateway %s exhausted for CID %s; trying next gateway", gateway, cid)

    message = f"Failed to download CID {cid} from all configured gateways"
    if last_error is None:
        raise IPFSFetchError(message)
    raise IPFSFetchError(f"{message}. Last error: {last_error}") from last_error


async def check_ipfs_gateway(timeout: float = 10.0) -> bool:
    """Check whether the primary IPFS gateway host is reachable."""
    gateway = _resolve_gateways()[0]
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.head(gateway)
            if response.status_code >= 400:
                response = await client.get(gateway)
        _log.info("IPFS gateway reachable: %s (HTTP %d)", gateway, response.status_code)
        return True
    except (httpx.TimeoutException, httpx.RequestError) as exc:
        _log.warning("IPFS gateway unreachable: %s (%s)", gateway, exc)
        return False
