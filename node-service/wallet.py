"""
wallet.py – Node wallet identity for ModelVerse node-service.

Reads the node operator's private key from the environment and exposes
a lightweight ``NodeWallet`` dataclass.  No web3 or signing logic yet —
that lives in blockchain_client.py (future module).

No external dependencies beyond the stdlib and dotenv.
"""

from __future__ import annotations

import os
import re
from dataclasses import dataclass

from logger import get_logger

_log = get_logger(__name__)

# A valid private key is 32 bytes = 64 lower-case hex characters.
_HEX_RE = re.compile(r"^[0-9a-fA-F]{64}$")


@dataclass(frozen=True)
class NodeWallet:
    """Immutable container for the node's on-chain identity."""

    private_key: str   # 64-char hex, no 0x prefix
    address: str       # Placeholder – will be derived from key via web3

    def __repr__(self) -> str:
        # Never print the full key in logs.
        masked = f"{self.private_key[:4]}…{self.private_key[-4:]}"
        return f"NodeWallet(address={self.address!r}, key={masked})"


def load_wallet() -> NodeWallet:
    """
    Construct a :class:`NodeWallet` from ``NODE_PRIVATE_KEY`` in the environment.

    Returns:
        A :class:`NodeWallet` with the raw private key and a placeholder address.

    Raises:
        EnvironmentError: If ``NODE_PRIVATE_KEY`` is missing or malformed.
    """
    raw: str | None = os.getenv("NODE_PRIVATE_KEY")
    if not raw:
        raise EnvironmentError(
            "NODE_PRIVATE_KEY is not set. "
            "Export it in your .env file as a 64-character hex string."
        )

    # Strip optional 0x prefix
    key = raw.removeprefix("0x")

    if not _HEX_RE.match(key):
        raise EnvironmentError(
            f"NODE_PRIVATE_KEY has invalid format (got length {len(key)}, "
            "expected 64 lowercase hex characters without '0x' prefix)."
        )

    # TODO: derive real address via eth_account once web3 is wired in.
    address_placeholder = "<address-pending-web3>"

    wallet = NodeWallet(private_key=key, address=address_placeholder)
    _log.debug("Wallet loaded: %r", wallet)
    return wallet
