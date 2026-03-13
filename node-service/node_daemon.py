"""
node_daemon.py – Main entry-point for the ModelVerse AI inference node.

This module contains only the structural skeleton (no blockchain / IPFS /
inference logic yet).  It wires together: environment loading, YAML config,
logging, and a basic async heartbeat loop.
"""

from __future__ import annotations

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import aiohttp

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


async def send_heartbeat(address: str, capabilities: NodeCapabilities) -> None:
    payload: dict[str, Any] = {
        "type": "heartbeat",
        "address": address,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "capabilities": capabilities.model_dump(),
    }
    _log.info("node heartbeat: address=%s", address)

    ws_url = os.getenv("COORDINATOR_WS_URL", "").strip()
    if not ws_url:
        return

    try:
        async with aiohttp.ClientSession() as session:
            async with session.ws_connect(ws_url, heartbeat=10) as ws:
                await ws.send_str(json.dumps(payload))
                _log.debug("Heartbeat sent to coordinator: %s", ws_url)
    except Exception as exc:  # noqa: BLE001
        _log.warning("Failed to send heartbeat to coordinator: %s", exc)


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


async def main() -> None:
    """
    Async entry-point for the ModelVerse node daemon.

    Startup sequence:
        1. Load environment variables from `.env`.
        2. Load YAML configuration from ``node_config.yaml``.
        3. Initialise the named logger.
        4. Ensure the model cache directory exists.
        5. Run a pre-flight healthcheck.
        6. Enter the heartbeat loop.
    """
    load_env()
    config: dict[str, Any] = load_config("node_config.yaml")
    cache_dir: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")
    ensure_dir(cache_dir)

    if not run_healthcheck(check_ipfs=True):
        _log.warning("Healthcheck reported issues; daemon will continue with heartbeat mode")

    wallet = create_wallet_from_env()
    capabilities = load_capabilities_from_config(config)

    max_cache_mb = int(config.get("performance", {}).get("max_model_cache_mb", 1024))
    model_cache = ModelCache(cache_dir=Path(cache_dir), max_cache_mb=max_cache_mb)
    engine = InferenceEngine(model_cache)

    ws_url = os.getenv("COORDINATOR_WS_URL", "").strip()
    auth_token = os.getenv("COORDINATOR_AUTH_TOKEN", "").strip() or None
    if not ws_url:
        raise EnvironmentError("COORDINATOR_WS_URL is required")

    job_client = JobClient(ws_url=ws_url, auth_token=auth_token, logger=_log)
    await job_client.connect()

    job_manager_address = os.getenv("JOB_MANAGER_ADDRESS", "").strip()
    if not job_manager_address:
        raise EnvironmentError("JOB_MANAGER_ADDRESS is required")
    job_manager = JobManagerClient(wallet.web3, job_manager_address)

    interval = int(config.get("node", {}).get("healthcheck_interval_seconds", 30))
    backoff = int(config.get("network", {}).get("reconnect_backoff_seconds", 5))
    _log.info("Starting node daemon (interval=%s sec address=%s)", interval, wallet.address)

    while True:
        try:
            await send_heartbeat(wallet.address, capabilities)
            job = await job_client.next_job(timeout=float(interval))
            if job is not None:
                try:
                    await handle_job(wallet, job_manager, engine, job_client, job)
                except Exception as exc:  # noqa: BLE001
                    _log.exception("Failed to handle job_id=%s: %s", job.job_id, exc)
            await asyncio.sleep(interval)
        except Exception as exc:  # noqa: BLE001
            _log.exception("Heartbeat loop error: %s", exc)
            await asyncio.sleep(backoff)


if __name__ == "__main__":
    asyncio.run(main())
