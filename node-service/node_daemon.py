"""
node_daemon.py – Main entry-point for the ModelVerse AI inference node.

This module contains only the structural skeleton (no blockchain / IPFS /
inference logic yet).  It wires together: environment loading, YAML config,
logging, and a basic async heartbeat loop.
"""

from __future__ import annotations

import asyncio
import os

from healthcheck import run_healthcheck
from logger import get_logger
from utils import ensure_dir, load_config, load_env

# ── Module logger (initialised after load_env so LOG_LEVEL is respected) ─────
# We defer get_logger() until inside main() to guarantee the env is loaded
# before the logging sub-system reads LOG_LEVEL.


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
    # ── 1. Environment ────────────────────────────────────────────────────────
    load_env()

    # ── 2. Configuration ──────────────────────────────────────────────────────
    config: dict = load_config("node_config.yaml")

    # ── 3. Logger ─────────────────────────────────────────────────────────────
    log = get_logger(__name__)

    # ── 4. Ensure model cache directory ───────────────────────────────────────
    cache_dir: str = os.getenv("MODEL_CACHE_DIR", "./models_cache")
    ensure_dir(cache_dir)

    # ── 5. Startup log banner ─────────────────────────────────────────────────
    rpc_url: str = os.getenv("RPC_URL", "<not set>")
    job_manager: str = os.getenv("JOB_MANAGER_ADDRESS", "<not set>")
    model_registry: str = os.getenv("MODEL_REGISTRY_ADDRESS", "<not set>")
    stake_registry: str = os.getenv("STAKE_REGISTRY_ADDRESS", "<not set>")
    coordinator_ws: str = os.getenv("COORDINATOR_WS_URL", "<not set>")

    log.info("━━━━━━━━━━━━━━━━━━  ModelVerse Node Daemon  ━━━━━━━━━━━━━━━━━━")
    log.info("Model cache dir  : %s", cache_dir)
    log.info("RPC URL          : %s", rpc_url)
    log.info("JobManager       : %s", job_manager)
    log.info("ModelRegistry    : %s", model_registry)
    log.info("StakeRegistry    : %s", stake_registry)
    log.info("Coordinator WS   : %s", coordinator_ws)
    log.info("Max concurrent   : %s", config["node"]["max_concurrent_jobs"])
    log.info("Preferred models : %s", config["node"]["preferred_model_types"])
    log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # ── 6. Pre-flight healthcheck ─────────────────────────────────────────────
    run_healthcheck()

    # ── 7. Heartbeat loop ─────────────────────────────────────────────────────
    healthcheck_interval: int = int(
        config["node"].get("healthcheck_interval_seconds", 30)
    )
    log.info(
        "Entering heartbeat loop (interval: %d seconds) …", healthcheck_interval
    )

    while True:
        await asyncio.sleep(healthcheck_interval)
        log.info("node heartbeat ♥")
        # TODO: poll for jobs, handle WebSocket events, run inference tasks


if __name__ == "__main__":
    asyncio.run(main())
