from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from web3 import Web3
from web3.contract import Contract

from logger import get_logger

_log = get_logger(__name__)


class ModelRegistryClient:
	"""Minimal read-only wrapper around the ModelRegistry contract."""

	def __init__(self, web3: Web3, address: str | None = None) -> None:
		self.web3 = web3
		raw_address = address or os.getenv("MODEL_REGISTRY_ADDRESS", "")
		if not raw_address:
			raise ValueError("MODEL_REGISTRY_ADDRESS is required")

		self.address = Web3.to_checksum_address(raw_address)
		self.abi = self._load_abi()
		self.contract: Contract = self.web3.eth.contract(address=self.address, abi=self.abi)

	def get_model_cid(self, model_id: int) -> str:
		"""
		Fetch CID/URI for a model ID.

		Supports common contract method names so this client remains usable
		across slight ABI variants during early development.
		"""
		functions = self.contract.functions
		candidate_methods = ("getModelCid", "getModelCID", "tokenURI", "modelURI")

		for method_name in candidate_methods:
			if hasattr(functions, method_name):
				value = getattr(functions, method_name)(model_id).call()
				if isinstance(value, str):
					return value

		raise RuntimeError(
			"ModelRegistry ABI does not expose a supported CID/URI getter. "
			"Expected one of: getModelCid, getModelCID, tokenURI, modelURI"
		)

	@staticmethod
	def _load_abi() -> list[dict[str, Any]]:
		abi_path = Path(__file__).resolve().parent / "abi" / "ModelRegistry.json"
		if not abi_path.exists():
			_log.warning("ModelRegistry ABI file not found at %s; using empty ABI", abi_path)
			return []

		raw = abi_path.read_text(encoding="utf-8").strip()
		if not raw:
			_log.warning("ModelRegistry ABI file is empty; using empty ABI")
			return []

		loaded = json.loads(raw)
		if isinstance(loaded, dict) and "abi" in loaded and isinstance(loaded["abi"], list):
			return loaded["abi"]
		if isinstance(loaded, list):
			return loaded
		raise ValueError("Unsupported ModelRegistry ABI format")
