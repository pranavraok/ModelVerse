# Usage:
#   1) Create and activate venv
#   2) pip install -r requirements.txt
#   3) cp .env.example .env  &&  fill values
#   4) python scripts/validate_node_setup.py
#   5) pytest  # to run full unit test suite

from __future__ import annotations

import asyncio
import os
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
	sys.path.insert(0, str(ROOT_DIR))

from healthcheck import run_healthcheck
from inference_engine import InferenceEngine
from ipfs_client import fetch_ipfs_file
from model_cache import CachedModel, ModelCache
from utils import load_config, load_env


def _mask_secret(value: str, show: int = 4) -> str:
	if not value:
		return ""
	if len(value) <= show * 2:
		return "*" * len(value)
	return f"{value[:show]}...{value[-show:]}"


def _print_section(title: str) -> None:
	print(f"\n=== {title} ===")


def _print_kv(key: str, value: str) -> None:
	print(f"{key}: {value}")


def _env_and_config_check() -> tuple[bool, dict[str, Any]]:
	_print_section("Env & Config")
	load_env(ROOT_DIR / ".env")

	try:
		config = load_config(ROOT_DIR / "node_config.yaml")
		print("Loaded node_config.yaml")
	except Exception as exc:  # noqa: BLE001
		print(f"Failed loading node_config.yaml: {exc}")
		return False, {}

	required = ["RPC_URL", "PINATA_GATEWAY_URL", "MODEL_CACHE_DIR"]
	missing = [name for name in required if not os.getenv(name)]

	_print_kv("RPC_URL", os.getenv("RPC_URL", ""))
	_print_kv("PINATA_GATEWAY_URL", os.getenv("PINATA_GATEWAY_URL", ""))
	_print_kv("MODEL_CACHE_DIR", os.getenv("MODEL_CACHE_DIR", ""))
	_print_kv("NODE_PRIVATE_KEY", _mask_secret(os.getenv("NODE_PRIVATE_KEY", "")))

	if missing:
		print(f"Missing required environment variables: {', '.join(missing)}")
		return False, config
	return True, config


def _healthcheck_check() -> bool:
	_print_section("Healthcheck")
	try:
		ok = run_healthcheck()
	except Exception:  # noqa: BLE001
		print("run_healthcheck() raised an exception:")
		traceback.print_exc()
		return False
	print(f"run_healthcheck() returned: {ok}")
	return ok


async def _ipfs_dry_run() -> str:
	_print_section("IPFS Fetch Dry Run")
	test_cid = os.getenv("TEST_MODEL_CID", "").strip()
	if not test_cid:
		print("skipped IPFS test (no TEST_MODEL_CID)")
		return "SKIPPED"

	try:
		data = await fetch_ipfs_file(test_cid)
		print(f"Fetched {len(data)} bytes from IPFS for CID {test_cid}")
		return "OK"
	except Exception as exc:  # noqa: BLE001
		print(f"IPFS fetch failed for CID {test_cid}: {exc}")
		traceback.print_exc()
		return "FAILED"


async def _model_cache_check() -> bool:
	_print_section("Model Cache")
	cache_dir = Path(os.getenv("MODEL_CACHE_DIR", "./models_cache")) / "validate"
	cache = ModelCache(cache_dir=cache_dir, max_cache_mb=100)

	counter = {"calls": 0}

	async def fake_fetcher(_: str) -> bytes:
		counter["calls"] += 1
		return b"dummy-model"

	first = await cache.get_or_fetch("dummy-cid", fake_fetcher)
	second = await cache.get_or_fetch("dummy-cid", fake_fetcher)

	ok = first.path.exists() and second.path == first.path and counter["calls"] == 1
	print(f"Cache file: {first.path}")
	print(f"Fetcher call count: {counter['calls']}")
	return ok


async def _inference_smoke_test() -> bool:
	_print_section("Inference Engine (Mocked)")

	class FakeInput:
		def __init__(self, name: str, shape: tuple[int, int, int, int]) -> None:
			self.name = name
			self.shape = shape

	class FakeOutput:
		def __init__(self, name: str) -> None:
			self.name = name

	class FakeSession:
		def __init__(self, model_path: str, providers: list[str]) -> None:
			self.model_path = model_path
			self.providers = providers

		def get_inputs(self) -> list[FakeInput]:
			return [FakeInput("input", (1, 3, 224, 224))]

		def get_outputs(self) -> list[FakeOutput]:
			return [FakeOutput("output")]

		def run(self, _, input_feed: dict[str, np.ndarray]) -> list[np.ndarray]:
			_ = input_feed
			return [np.array([[0.1, 1.0, -0.5]], dtype=np.float32)]

	cache_dir = Path(os.getenv("MODEL_CACHE_DIR", "./models_cache")) / "validate"
	cache = ModelCache(cache_dir=cache_dir, max_cache_mb=100)
	engine = InferenceEngine(cache=cache)

	dummy_path = cache_dir / "dummy-cid.onnx"
	dummy_path.parent.mkdir(parents=True, exist_ok=True)
	dummy_path.write_bytes(b"dummy")

	async def fake_get_or_fetch(self: ModelCache, cid: str, fetcher):
		_ = fetcher
		return CachedModel(
			cid=cid,
			path=dummy_path,
			size_bytes=dummy_path.stat().st_size,
			last_accessed=datetime.now(timezone.utc),
		)

	import inference_engine as inf_module
	original_session_ctor = inf_module.ort.InferenceSession
	original_get_or_fetch = ModelCache.get_or_fetch

	try:
		inf_module.ort.InferenceSession = FakeSession
		ModelCache.get_or_fetch = fake_get_or_fetch

		image = Image.new("RGB", (512, 512), color="red")
		topk = await engine.classify_image(
			cid="dummy-cid",
			image=image,
			input_name="input",
			top_k=5,
		)
		print(f"Top-k predictions: {topk}")
		return len(topk) > 0
	except Exception:  # noqa: BLE001
		print("Inference smoke test failed:")
		traceback.print_exc()
		return False
	finally:
		inf_module.ort.InferenceSession = original_session_ctor
		ModelCache.get_or_fetch = original_get_or_fetch


async def _run() -> int:
	env_ok, _ = _env_and_config_check()
	health_ok = _healthcheck_check()
	ipfs_status = await _ipfs_dry_run()
	cache_ok = await _model_cache_check()
	inference_ok = await _inference_smoke_test()

	print("\n=== Summary ===")
	print(f"Env/config: {'OK' if env_ok else 'FAILED'}")
	print(f"Healthcheck: {'OK' if health_ok else 'FAILED'}")
	print(f"IPFS fetch: {ipfs_status}")
	print(f"Model cache: {'OK' if cache_ok else 'FAILED'}")
	print(f"Inference engine: {'OK' if inference_ok else 'FAILED'}")

	mandatory_ok = env_ok and health_ok and cache_ok and inference_ok
	return 0 if mandatory_ok else 1


if __name__ == "__main__":
	raise SystemExit(asyncio.run(_run()))
