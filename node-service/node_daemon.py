"""
node_daemon.py – Main entry-point for the ModelVerse AI inference node.

Fixes applied:
1. send_heartbeat() uses HTTP POST to /api/nodes/heartbeat (not a new WS).
2. job_client.next_job() is wrapped with reconnect logic so that when the
   WS drops (close frames 8:1011 or 257:None), the daemon reconnects and
   resumes — instead of crashing the entire heartbeat loop.
"""

from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import aiohttp
from aiohttp import WSServerHandshakeError

from backend_client import BackendClient
from contracts.job_manager_client import JobManagerClient
from healthcheck import run_healthcheck
from inference_engine import InferenceEngine
from job_client import JobClient, JobPayload, decode_input_image
from logger import get_logger
from model_cache import ModelCache
from node_capabilities import NodeCapabilities, load_capabilities_from_config
from utils import ensure_dir, load_config, load_env
from wallet import Wallet, create_wallet_from_env

_log = get_logger(__name__)

_RECONNECT_DELAY_SECONDS = 5


async def send_heartbeat(address: str, capabilities: NodeCapabilities) -> None:
    """
    Send a heartbeat via HTTP POST to /api/nodes/heartbeat.
    Does NOT open a new WebSocket — that was the original source of 403 spam.
    """
    _log.info("node heartbeat: address=%s", address)

    backend_http_url = os.getenv("BACKEND_HTTP_URL", "").strip().rstrip("/")
    if not backend_http_url:
        _log.debug("BACKEND_HTTP_URL not set, skipping HTTP heartbeat")
        return

    heartbeat_url = f"{backend_http_url}/api/nodes/heartbeat"
    headers = {
        "x-wallet-address": address,
        "x-node-api-key": os.getenv("NODE_API_KEY", os.getenv("COORDINATOR_AUTH_TOKEN", "")),
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                heartbeat_url,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                if resp.status == 200:
                    _log.debug("Heartbeat OK: %s", await resp.json())
                else:
                    body = await resp.text()
                    _log.warning("Heartbeat returned HTTP %s: %s", resp.status, body)
    except Exception as exc:  # noqa: BLE001
        _log.warning("Failed to send heartbeat to backend: %s", exc)


async def handle_job(
    wallet: Wallet,
    job_manager: JobManagerClient,
    engine: InferenceEngine,
    job_client: JobClient,
    job: JobPayload,
) -> None:
    if job.model_input_type.lower() != "image":
        raise ValueError(f"Unsupported model_input_type={job.model_input_type}")

    image = decode_input_image(job)
    preds = await engine.classify_image(
        cid=job.model_cid,
        image=image,
        input_name="input",
        top_k=3,
    )
    output = {
        "top_k": [
            {"class_index": int(idx), "prob": float(prob)}
            for idx, prob in preds
        ]
    }

    tx = job_manager.build_settle_job_tx(
        from_address=wallet.address,
        job_id=job.job_id,
        node_address=wallet.address,
        creator_address=job.creator_address,
    )
    receipt = wallet.build_and_send_tx(tx)
    _log.info(
        "settleJob mined: job_id=%s hash=%s status=%s",
        job.job_id,
        receipt.transactionHash.hex(),
        receipt.status,
    )

    await job_client.send_result(job.job_id, output)


def _is_ws_disconnect_error(exc: BaseException) -> bool:
    """
    Return True for exceptions that mean the WebSocket dropped and
    we need to reconnect. Matches the two error signatures seen in logs:

      • "Cannot write to closing transport"  (ClientConnectionResetError)
      • "Received message 8:1011 is not WSMsgType.TEXT"   (WS close frame)
      • "Received message 257:None is not WSMsgType.TEXT" (aiohttp CLOSED)
    """
    err_str = str(exc)
    if any(phrase in err_str for phrase in (
        "closing transport",
        "Cannot write",
        "is not WSMsgType.TEXT",
        "message 8:",
        "message 257:",
        "Connection reset",
    )):
        return True
    return type(exc).__name__ in (
        "ClientConnectionResetError",
        "ServerDisconnectedError",
        "WSMessageTypeError",
        "WSServerHandshakeError",
        "ConnectionResetError",
    )


async def _reconnect(job_client: JobClient, ws_url: str) -> bool:
    """Call job_client.connect() again. Returns True on success."""
    _log.info("Reconnecting to coordinator WS: %s", ws_url)
    try:
        await job_client.connect()
        _log.info("WS reconnected OK")
        return True
    except Exception as exc:  # noqa: BLE001
        _log.error("WS reconnect failed: %s", exc)
        return False


async def main() -> None:
    load_env()
    config: dict[str, Any] = load_config("node_config.yaml")
    cache_dir: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")
    ensure_dir(cache_dir)

    if not run_healthcheck(check_ipfs=True):
        _log.warning("Healthcheck reported issues; daemon will continue with heartbeat mode")

    wallet = create_wallet_from_env()
    capabilities = load_capabilities_from_config(config)

    node_api_key = os.getenv("NODE_API_KEY", "").strip()
    node_id: str | None = None

    if not node_api_key:
        backend_http_url = os.getenv("BACKEND_HTTP_URL", "").strip()
        if not backend_http_url:
            raise EnvironmentError("BACKEND_HTTP_URL is required when NODE_API_KEY is not set")

        backend_client = BackendClient(
            base_url=backend_http_url,
            wallet_address=wallet.address,
            logger=_log,
        )
        registration = await backend_client.register_node()
        node_id = registration.node_id
        node_api_key = registration.api_key
        os.environ["NODE_API_KEY"] = node_api_key
        os.environ["COORDINATOR_AUTH_TOKEN"] = node_api_key
        _log.info("Registered node with backend: node_id=%s", node_id)
    else:
        _log.info("Using NODE_API_KEY from environment (registration skipped)")

    max_cache_mb = int(config.get("performance", {}).get("max_model_cache_mb", 1024))
    model_cache = ModelCache(cache_dir=Path(cache_dir), max_cache_mb=max_cache_mb)
    engine = InferenceEngine(model_cache)

    ws_url = os.getenv("COORDINATOR_WS_URL", "").strip()
    auth_token = node_api_key or (os.getenv("COORDINATOR_AUTH_TOKEN", "").strip() or None)
    if not ws_url:
        raise EnvironmentError("COORDINATOR_WS_URL is required")

    job_client = JobClient(
        ws_url=ws_url,
        auth_token=auth_token,
        wallet_address=wallet.address,
        logger=_log,
        node_id=node_id,
    )

    try:
        await job_client.connect()
    except WSServerHandshakeError as exc:
        _log.error("Failed initial connection to coordinator WS: %s", exc)
        return

    job_manager_address = os.getenv("JOB_MANAGER_ADDRESS", "").strip()
    if not job_manager_address:
        raise EnvironmentError("JOB_MANAGER_ADDRESS is required")
    job_manager = JobManagerClient(wallet.web3, job_manager_address)

    interval = int(config.get("node", {}).get("healthcheck_interval_seconds", 30))
    backoff = int(config.get("network", {}).get("reconnect_backoff_seconds", _RECONNECT_DELAY_SECONDS))

    _log.info(
        "Starting node daemon (interval=%s sec address=%s node_id=%s)",
        interval,
        wallet.address,
        node_id,
    )

    while True:
        try:
            # ── 1. Heartbeat via HTTP ─────────────────────────────────────
            await send_heartbeat(wallet.address, capabilities)

            # ── 2. Poll for next job — with disconnect recovery ───────────
            job: JobPayload | None = None
            try:
                job = await job_client.next_job(timeout=float(interval))
            except Exception as exc:  # noqa: BLE001
                if _is_ws_disconnect_error(exc):
                    _log.warning(
                        "WS dropped (%s: %s) — will reconnect in %ss",
                        type(exc).__name__, exc, backoff,
                    )
                    await asyncio.sleep(backoff)
                    await _reconnect(job_client, ws_url)
                    # Skip rest of this iteration; reconnected WS will be
                    # used on the next loop pass.
                    continue
                _log.exception("Unexpected error polling for job: %s", exc)
                await asyncio.sleep(backoff)
                continue

            # ── 3. Execute job if assigned ────────────────────────────────
            if job is not None:
                try:
                    await handle_job(wallet, job_manager, engine, job_client, job)
                except Exception as exc:  # noqa: BLE001
                    _log.exception("Failed to handle job_id=%s: %s", job.job_id, exc)

            await asyncio.sleep(interval)

        except Exception as exc:  # noqa: BLE001
            _log.exception("Daemon loop error: %s", exc)
            await asyncio.sleep(backoff)


if __name__ == "__main__":
    asyncio.run(main())