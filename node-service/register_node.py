"""
register_node.py – One-shot node registration helper for ModelVerse node-service.

Run this script *once* before starting the daemon to validate your
configuration and (in Phase 2) submit a ``registerNode()`` transaction
to the StakeRegistry smart contract.

Usage::

    python register_node.py

No blockchain calls are made yet — this is pure scaffolding.
"""

from __future__ import annotations

import asyncio
import os

from healthcheck import run_healthcheck
from logger import get_logger
from utils import load_config, load_env
from wallet import load_wallet

_log = get_logger(__name__)


async def register() -> None:
    """
    Async registration flow (scaffolding).

    Steps (current):
        1. Load environment & config.
        2. Run pre-flight healthcheck.
        3. Load wallet identity.
        4. Log registration intent with key contract addresses.
        5. (Phase 2) Submit stake transaction via blockchain_client.

    Raises:
        EnvironmentError: If wallet or env variables are misconfigured.
        SystemExit: On healthcheck failure.
    """
    # ── Environment & config ──────────────────────────────────────────────────
    load_env()
    config: dict = load_config()

    # ── Healthcheck ───────────────────────────────────────────────────────────
    ok = run_healthcheck()
    if not ok:
        _log.error("Registration aborted: healthcheck failed.")
        raise SystemExit(1)

    # ── Wallet ────────────────────────────────────────────────────────────────
    wallet = load_wallet()

    # ── Registration intent log ───────────────────────────────────────────────
    stake_registry: str = os.getenv("STAKE_REGISTRY_ADDRESS", "<not set>")
    rpc_url: str = os.getenv("RPC_URL", "<not set>")
    model_types: list[str] = config["node"].get("preferred_model_types", [])

    _log.info("━━━━━━━━━━━━  ModelVerse Node Registration  ━━━━━━━━━━━━")
    _log.info("Wallet address    : %s", wallet.address)
    _log.info("StakeRegistry     : %s", stake_registry)
    _log.info("RPC URL           : %s", rpc_url)
    _log.info("Preferred models  : %s", model_types)
    _log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # TODO (Phase 2): call blockchain_client.register_node(wallet, stake_registry)
    _log.warning(
        "Blockchain registration not yet implemented. "
        "Register manually via the Node Dashboard at your frontend URL."
    )
    _log.info("Registration stub complete ✔  (Phase 2 will submit the on-chain tx)")


if __name__ == "__main__":
    asyncio.run(register())
