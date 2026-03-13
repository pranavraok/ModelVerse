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
	"""Thin Web3 wrapper around ModelVerseJobManager."""

	def __init__(self, web3: Web3, address: str | None = None) -> None:
		self.web3 = web3
		raw_address = address or os.getenv("JOB_MANAGER_ADDRESS", "")
		if not raw_address:
			raise ValueError("JOB_MANAGER_ADDRESS is required")

		self.address = Web3.to_checksum_address(raw_address)
		self.abi = self._load_abi()
		self.contract: Contract = self.web3.eth.contract(address=self.address, abi=self.abi)

	def build_register_node_tx(self, from_address: str, capabilities_json: str) -> TxParams:
		"""Builds registerNode(capabilitiesJson) transaction params."""
		tx = self.contract.functions.registerNode(capabilities_json).build_transaction(
			{"from": Web3.to_checksum_address(from_address)}
		)
		return TxParams(tx)

	def build_deposit_stake_tx(self, from_address: str, amount_wei: int) -> TxParams:
		"""Builds a transaction for depositing stake for this node."""
		from_checksum = Web3.to_checksum_address(from_address)

		if self._supports_function_with_arity("depositStake", 1):
			tx = self.contract.functions.depositStake(amount_wei).build_transaction(
				{"from": from_checksum, "value": 0}
			)
			return TxParams(tx)

		if self._supports_function_with_arity("depositStake", 0):
			tx = self.contract.functions.depositStake().build_transaction(
				{"from": from_checksum, "value": amount_wei}
			)
			return TxParams(tx)

		raise RuntimeError("depositStake function not found in JobManager ABI")

	def build_submit_result_tx(
		self,
		job_id: int,
		output_hash: bytes,
		execution_time_ms: int,
	) -> TxParams:
		"""Build submitResult transaction params with caller-defined gas/nonce."""
		fn = self.contract.functions.submitResult(job_id, output_hash, execution_time_ms)
		data = fn._encode_transaction_data()
		return TxParams({"to": self.address, "data": data})

	def build_settle_job_tx(
		self,
		from_address: str,
		job_id: int,
		node_address: str,
		creator_address: str,
	) -> TxParams:
		"""Build tx for settleJob(jobId, node, creator)."""
		tx = self.contract.functions.settleJob(
			int(job_id),
			Web3.to_checksum_address(node_address),
			Web3.to_checksum_address(creator_address),
		).build_transaction({"from": Web3.to_checksum_address(from_address)})
		return TxParams(tx)

	def get_job(self, job_id: int) -> dict[str, Any]:
		"""Read jobs(jobId) view and return a plain dict for debugging."""
		raw = self.contract.functions.jobs(int(job_id)).call()
		if isinstance(raw, dict):
			return raw
		if isinstance(raw, (list, tuple)):
			return {"raw": list(raw)}
		return {"raw": raw}

	def _supports_function_with_arity(self, name: str, arity: int) -> bool:
		for entry in self.abi:
			if entry.get("type") != "function":
				continue
			if entry.get("name") != name:
				continue
			inputs = entry.get("inputs", [])
			if isinstance(inputs, list) and len(inputs) == arity:
				return True
		return False

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
