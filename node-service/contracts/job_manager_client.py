from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from web3 import Web3
from web3.contract import Contract
from web3.types import TxParams

from logger import get_logger

_log = get_logger(__name__)


class JobManagerClient:
	"""Minimal wrapper around the JobManager contract."""

	def __init__(self, web3: Web3, address: str | None = None) -> None:
		self.web3 = web3
		raw_address = address or os.getenv("JOB_MANAGER_ADDRESS", "")
		if not raw_address:
			raise ValueError("JOB_MANAGER_ADDRESS is required")

		self.address = Web3.to_checksum_address(raw_address)
		self.abi = self._load_abi()
		self.contract: Contract = self.web3.eth.contract(address=self.address, abi=self.abi)

	def build_submit_result_tx(
		self,
		job_id: int,
		output_hash: bytes,
		execution_time_ms: int,
	) -> TxParams:
		"""
		Build a submitResult transaction payload.

		Note: this returns only ``to`` and ``data``. Nonce, gas, chain ID,
		and sender-specific fields are intentionally left to the caller.
		"""
		fn = self.contract.functions.submitResult(job_id, output_hash, execution_time_ms)
		data = fn._encode_transaction_data()
		return TxParams({"to": self.address, "data": data})

	@staticmethod
	def _load_abi() -> list[dict[str, Any]]:
		abi_path = Path(__file__).resolve().parent / "abi" / "JobManager.json"
		if not abi_path.exists():
			_log.warning("JobManager ABI file not found at %s; using empty ABI", abi_path)
			return []

		raw = abi_path.read_text(encoding="utf-8").strip()
		if not raw:
			_log.warning("JobManager ABI file is empty; using empty ABI")
			return []

		loaded = json.loads(raw)
		if isinstance(loaded, dict) and "abi" in loaded and isinstance(loaded["abi"], list):
			return loaded["abi"]
		if isinstance(loaded, list):
			return loaded
		raise ValueError("Unsupported JobManager ABI format")
