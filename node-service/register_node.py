from __future__ import annotations

import argparse
import os
import sys

from contracts.job_manager_client import JobManagerClient
from healthcheck import run_healthcheck
from logger import get_logger
from node_capabilities import load_capabilities_from_config
from utils import load_config, load_env
from wallet import create_wallet_from_env

_log = get_logger(__name__)


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Register this node in JobManager")
    parser.add_argument(
        "--stake",
        type=float,
        default=0.0,
        help="Stake amount in MATIC (default: 0.0)",
    )
    return parser.parse_args()


def register(stake: float) -> int:
    load_env()
    config = load_config()

    if not run_healthcheck():
        _log.error("Registration aborted: healthcheck failed")
        return 1

    try:
        wallet = create_wallet_from_env()
        job_manager_address = os.getenv("JOB_MANAGER_ADDRESS", "").strip()
        if not job_manager_address:
            raise EnvironmentError("JOB_MANAGER_ADDRESS is required")

        client = JobManagerClient(wallet.web3, job_manager_address)
        capabilities = load_capabilities_from_config(config)
        capabilities_json = capabilities.model_dump_json()

        print("Node address:", wallet.address)
        print("Stake amount (MATIC):", stake)

        if stake > 0:
            amount_wei = int(wallet.web3.to_wei(stake, "ether"))
            deposit_tx = client.build_deposit_stake_tx(wallet.address, amount_wei)
            deposit_receipt = wallet.build_and_send_tx(deposit_tx)
            print("depositStake tx hash:", deposit_receipt.transactionHash.hex())
            print("depositStake status:", int(deposit_receipt.status))

        register_tx = client.build_register_node_tx(wallet.address, capabilities_json)
        register_receipt = wallet.build_and_send_tx(register_tx)
        print("registerNode tx hash:", register_receipt.transactionHash.hex())
        print("registerNode status:", int(register_receipt.status))
        return 0
    except Exception as exc:  # noqa: BLE001
        _log.exception("Node registration failed: %s", exc)
        return 1


def main() -> None:
    args = _parse_args()
    code = register(stake=args.stake)
    raise SystemExit(code)


if __name__ == "__main__":
    main()
