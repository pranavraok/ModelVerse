from __future__ import annotations

import os
import re
from dataclasses import dataclass, field
from typing import Any

from web3 import Web3
from web3.types import TxParams, TxReceipt

from logger import get_logger

_log = get_logger(__name__)

_HEX_RE = re.compile(r"^0x[0-9a-fA-F]{64}$")


@dataclass
class Wallet:
    web3: Web3
    address: str
    private_key: str = field(repr=False)

    def get_nonce(self) -> int:
        return self.web3.eth.get_transaction_count(self.address)

    def get_chain_id(self) -> int:
        return int(self.web3.eth.chain_id)

    def build_and_send_tx(self, tx: TxParams) -> TxReceipt:
        tx_dict: dict[str, Any] = dict(tx)
        tx_dict.setdefault("from", self.address)
        tx_dict.setdefault("nonce", self.get_nonce())
        tx_dict.setdefault("chainId", self.get_chain_id())
        tx_dict.setdefault("gasPrice", int(self.web3.eth.gas_price))

        gas_estimate = int(self.web3.eth.estimate_gas(tx_dict))
        tx_dict.setdefault("gas", gas_estimate)

        signed = self.web3.eth.account.sign_transaction(tx_dict, private_key=self.private_key)
        tx_hash = self.web3.eth.send_raw_transaction(signed.raw_transaction)
        _log.info("Submitted transaction: %s", tx_hash.hex())

        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        _log.info("Transaction mined: hash=%s status=%s", tx_hash.hex(), receipt.status)
        return receipt


def create_wallet_from_env() -> Wallet:
    """Reads RPC_URL and NODE_PRIVATE_KEY from env and returns a Wallet."""
    rpc_url = os.getenv("RPC_URL", "").strip()
    if not rpc_url:
        raise EnvironmentError("RPC_URL is required")

    private_key = os.getenv("NODE_PRIVATE_KEY", "").strip()
    if not private_key:
        raise EnvironmentError("NODE_PRIVATE_KEY is required")
    if not _HEX_RE.match(private_key):
        raise EnvironmentError("NODE_PRIVATE_KEY must start with 0x and contain 64 hex chars")

    web3 = Web3(Web3.HTTPProvider(rpc_url))
    account = web3.eth.account.from_key(private_key)
    wallet = Wallet(web3=web3, address=Web3.to_checksum_address(account.address), private_key=private_key)
    _log.debug("Wallet ready for address=%s", wallet.address)
    return wallet


# Backward-compatible aliases used by older scaffolding.
NodeWallet = Wallet


def load_wallet() -> Wallet:
    return create_wallet_from_env()
