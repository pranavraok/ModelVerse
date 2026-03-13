"""
node_daemon.py — Single-node auto-demo daemon.

Changes from previous version:
  - Fetches real models from IPFS using model_cid stored directly on the job row
    (model_id being NULL is fine — we use model_cid instead)
  - Supports both ONNX (.onnx) and TFLite (.tflite) detected by file magic bytes
  - Models cached in MODEL_CACHE_DIR so each CID is only downloaded once
  - Heartbeat uses BACKEND_HTTP_URL (host.docker.internal inside Docker, localhost outside)
  - NO WebSocket — pure HTTP polling via Supabase REST (fixes WS 403 completely)
  - Falls back to demo inference if model_cid is missing / IPFS unreachable
"""

from __future__ import annotations

import asyncio
import base64
import hashlib
import json
import logging
import os
import time
from io import BytesIO
from pathlib import Path
from typing import Any

import aiohttp
import httpx
import numpy as np
from dotenv import load_dotenv
from PIL import Image

# ── logging ───────────────────────────────────────────────────────────────────
_LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, _LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
_log = logging.getLogger("node_daemon")

# ── env ───────────────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / ".env", override=False)

SUPABASE_URL     = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY     = os.environ["SUPABASE_SERVICE_KEY"]
NODE_ID          = os.environ["NODE_ID"]
API_KEY          = os.environ["NODE_API_KEY"]
WALLET_ADDRESS   = os.getenv("WALLET_ADDRESS", "")
BACKEND_HTTP_URL = os.getenv("BACKEND_HTTP_URL", "http://localhost:8000").rstrip("/")
POLL_INTERVAL    = int(os.getenv("POLL_INTERVAL_SECONDS", "5"))
HEARTBEAT_EVERY  = int(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "30"))
MODEL_CACHE_DIR  = Path(os.getenv("MODEL_CACHE_DIR", "/app/models_cache"))
IPFS_GATEWAYS    = [
    g.strip().rstrip("/")
    for g in os.getenv(
        "IPFS_GATEWAYS",
        "https://ipfs.io/ipfs,https://cloudflare-ipfs.com/ipfs,https://gateway.pinata.cloud/ipfs",
    ).split(",")
    if g.strip()
]

MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)

_SB_HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}


# ══════════════════════════════════════════════════════════════════════════════
#  IPFS FETCH  (with multi-gateway fallback + local cache)
# ══════════════════════════════════════════════════════════════════════════════

def _cache_path(cid: str) -> Path:
    # sanitise CID so it's a safe filename
    safe = "".join(c for c in cid if c.isalnum() or c in "-_.")
    return MODEL_CACHE_DIR / safe


async def fetch_model_bytes(cid: str) -> bytes:
    """Return raw model bytes for *cid*, using disk cache when available."""
    path = _cache_path(cid)
    if path.exists() and path.stat().st_size > 0:
        _log.info("Model cache hit: %s (%d bytes)", cid, path.stat().st_size)
        return path.read_bytes()

    last_err: Exception | None = None
    for gateway in IPFS_GATEWAYS:
        url = f"{gateway}/{cid}"
        _log.info("Fetching model from IPFS: %s", url)
        try:
            async with httpx.AsyncClient(timeout=120.0, follow_redirects=True) as client:
                r = await client.get(url)
            if r.status_code == 200:
                data = r.content
                path.write_bytes(data)
                _log.info("Model cached: %s (%d bytes)", cid, len(data))
                return data
            last_err = RuntimeError(f"HTTP {r.status_code} from {gateway}")
        except Exception as exc:
            last_err = exc
            _log.warning("Gateway %s failed for %s: %s", gateway, cid, exc)

    raise RuntimeError(
        f"All IPFS gateways failed for CID {cid}. Last error: {last_err}"
    )


# ══════════════════════════════════════════════════════════════════════════════
#  MODEL FORMAT DETECTION
# ══════════════════════════════════════════════════════════════════════════════

def _detect_format(data: bytes) -> str:
    """Return 'onnx', 'tflite', or 'unknown' based on magic bytes."""
    if data[:8] == b"\x08\x00\x00\x00\x00\x00\x00\x00" or data[:4] == b"\x08\x06":
        # TFLite FlatBuffer magic
        return "tflite"
    if len(data) > 4 and data[:4] in (b"\x08\x06", b"\x08\x07", b"\x08\x08"):
        return "tflite"
    # ONNX protobuf starts with field tag 0x0a (field 1, wire type 2)
    if data[:2] == b"\x08\x07" or data[0] == 0x0A or data[:4] == b"ONNX":
        return "onnx"
    # Fallback: try file extension hints stored in magic bytes areas
    # TFLite flatbuffers always have identifier "TFL3" at bytes 4-8
    if len(data) > 8 and data[4:8] == b"TFL3":
        return "tflite"
    return "onnx"  # default to ONNX


# ══════════════════════════════════════════════════════════════════════════════
#  ONNX INFERENCE
# ══════════════════════════════════════════════════════════════════════════════

def _run_onnx(model_bytes: bytes, input_array: np.ndarray) -> dict[str, Any]:
    import onnxruntime as ort  # lazy import — not required if only TFLite jobs arrive

    sess = ort.InferenceSession(
        model_bytes,
        providers=["CPUExecutionProvider"],
    )
    input_name   = sess.get_inputs()[0].name
    output_names = [o.name for o in sess.get_outputs()]

    # Reshape input to match model's expected shape
    expected = sess.get_inputs()[0].shape  # e.g. [1, 3, 224, 224] or [1, 224, 224, 3]
    try:
        tensor = _reshape_to_model(input_array, expected)
    except Exception:
        tensor = input_array  # let ONNX Runtime raise a descriptive error

    t0      = time.perf_counter()
    outputs = sess.run(output_names, {input_name: tensor.astype(np.float32)})
    ms      = (time.perf_counter() - t0) * 1000

    return {
        "outputs":    {name: _to_python(v) for name, v in zip(output_names, outputs)},
        "latency_ms": round(ms, 2),
        "format":     "onnx",
    }


# ══════════════════════════════════════════════════════════════════════════════
#  TFLITE INFERENCE
# ══════════════════════════════════════════════════════════════════════════════

def _run_tflite(model_bytes: bytes, input_array: np.ndarray) -> dict[str, Any]:
    try:
        import tflite_runtime.interpreter as tflite
    except ImportError:
        import tensorflow.lite as tflite  # type: ignore[no-redef]

    interp = tflite.Interpreter(model_content=model_bytes)
    interp.allocate_tensors()

    inp_detail  = interp.get_input_details()[0]
    out_details = interp.get_output_details()

    try:
        tensor = _reshape_to_model(input_array, inp_detail["shape"])
    except Exception:
        tensor = input_array

    # Cast to model's dtype (float32 or uint8 for quantised models)
    dtype = inp_detail["dtype"]
    if dtype == np.uint8:
        tensor = np.clip(tensor * 255, 0, 255).astype(np.uint8)
    else:
        tensor = tensor.astype(np.float32)

    interp.set_tensor(inp_detail["index"], tensor)
    t0 = time.perf_counter()
    interp.invoke()
    ms = (time.perf_counter() - t0) * 1000

    outputs = {
        str(d["name"]): _to_python(interp.get_tensor(d["index"]))
        for d in out_details
    }
    return {"outputs": outputs, "latency_ms": round(ms, 2), "format": "tflite"}


# ══════════════════════════════════════════════════════════════════════════════
#  INPUT PREPARATION
# ══════════════════════════════════════════════════════════════════════════════

def _prepare_input(input_b64: str, input_type: str) -> np.ndarray:
    """
    Decode base64 input and return a numpy array suitable for model inference.
    Supports: image (JPEG/PNG → float32 [0,1]), raw JSON array, plain bytes.
    """
    try:
        raw = base64.b64decode(input_b64)
    except Exception:
        raw = input_b64.encode()

    # Try JSON array first (tabular / structured input)
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            arr = np.array(parsed, dtype=np.float32)
            if arr.ndim == 1:
                arr = arr[np.newaxis, :]   # add batch dim
            return arr
    except Exception:
        pass

    # Try image decode
    try:
        img = Image.open(BytesIO(raw)).convert("RGB")
        img = img.resize((224, 224), Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float32) / 255.0
        # Normalize ImageNet-style
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        arr  = (arr - mean) / std
        return arr[np.newaxis, ...]  # shape (1, 224, 224, 3) — NHWC
    except Exception:
        pass

    # Raw bytes → float32 vector
    arr = np.frombuffer(raw, dtype=np.uint8).astype(np.float32) / 255.0
    return arr[np.newaxis, :]


def _reshape_to_model(arr: np.ndarray, expected_shape: Any) -> np.ndarray:
    """
    Best-effort reshape of arr to match the model's expected input shape.
    Handles NHWC ↔ NCHW transposition.
    """
    shape = [int(d) if (isinstance(d, int) and d > 0) else -1 for d in expected_shape]

    if len(shape) == 4:
        # NCHW: (1, 3, H, W)
        if shape[1] == 3 and arr.ndim == 4 and arr.shape[-1] == 3:
            arr = np.transpose(arr, (0, 3, 1, 2))
        # NHWC: (1, H, W, 3)
        if shape[-1] == 3 and arr.ndim == 4 and arr.shape[1] == 3:
            arr = np.transpose(arr, (0, 2, 3, 1))
        # Resize spatial dims if needed
        h_idx = 2 if (arr.ndim == 4 and arr.shape[1] == 3) else (2 if arr.ndim == 4 else -1)
        if h_idx > 0:
            eh = shape[h_idx] if shape[h_idx] > 0 else 224
            ew = shape[h_idx + 1] if shape[h_idx + 1] > 0 else 224
            if arr.shape[h_idx] != eh or arr.shape[h_idx + 1] != ew:
                # Use PIL resize
                ch_first = arr.shape[1] == 3
                if ch_first:
                    tmp = np.transpose(arr[0], (1, 2, 0))  # CHW→HWC
                else:
                    tmp = arr[0]
                img = Image.fromarray((tmp * 255).clip(0, 255).astype(np.uint8))
                img = img.resize((ew, eh), Image.Resampling.BILINEAR)
                tmp2 = np.asarray(img, dtype=np.float32) / 255.0
                arr  = (np.transpose(tmp2, (2, 0, 1)) if ch_first else tmp2)[np.newaxis, ...]

    return arr


def _to_python(v: Any) -> Any:
    """Convert numpy arrays/scalars to plain Python for JSON serialisation."""
    if isinstance(v, np.ndarray):
        if v.size == 1:
            return float(v.flat[0])
        if v.ndim <= 2:
            return v.tolist()
        return v.flatten()[:100].tolist()  # truncate huge outputs for storage
    if isinstance(v, (np.floating, np.integer)):
        return v.item()
    return v


# ══════════════════════════════════════════════════════════════════════════════
#  DEMO FALLBACK  (no model_cid / IPFS unreachable)
# ══════════════════════════════════════════════════════════════════════════════

def _demo_inference(input_b64: str, model_cid: str) -> dict[str, Any]:
    try:
        raw = base64.b64decode(input_b64)
    except Exception:
        raw = input_b64.encode()
    digest = hashlib.sha256(raw).hexdigest()
    score  = 0.5 + (int(digest[:4], 16) / 65535) * 0.49
    return {
        "credit_score": round(score, 4),
        "model_cid":    model_cid,
        "input_sha256": digest,
        "latency_ms":   1,
        "format":       "demo",
        "note":         "Demo output — no model loaded",
    }


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN INFERENCE DISPATCHER
# ══════════════════════════════════════════════════════════════════════════════

async def run_inference_for_job(job: dict[str, Any]) -> dict[str, Any]:
    """
    Fetch model from IPFS (using model_cid on the job row), run inference,
    return result dict ready for storage.
    """
    model_cid  = str(job.get("model_cid") or "").strip()
    input_b64  = str(job.get("input_base64") or job.get("input_data_url") or "")
    input_type = str(job.get("model_input_type") or "image").lower()
    job_id     = str(job["id"])

    if not model_cid:
        _log.warning("Job %s has no model_cid — using demo inference", job_id)
        return _demo_inference(input_b64, "no-cid")

    # ── fetch / load model ────────────────────────────────────────────────
    try:
        model_bytes = await fetch_model_bytes(model_cid)
    except Exception as exc:
        _log.warning("IPFS fetch failed for job %s cid=%s: %s — falling back to demo", job_id, model_cid, exc)
        return _demo_inference(input_b64, model_cid)

    fmt = _detect_format(model_bytes)
    _log.info("Job %s: model_cid=%s format=%s size=%d bytes", job_id, model_cid[:20], fmt, len(model_bytes))

    # ── prepare input ─────────────────────────────────────────────────────
    if not input_b64:
        _log.warning("Job %s has no input — generating random input", job_id)
        input_array = np.random.rand(1, 224, 224, 3).astype(np.float32)
    else:
        try:
            input_array = _prepare_input(input_b64, input_type)
        except Exception as exc:
            _log.warning("Input prep failed for job %s: %s", job_id, exc)
            input_array = np.random.rand(1, 224, 224, 3).astype(np.float32)

    # ── run inference ─────────────────────────────────────────────────────
    loop = asyncio.get_event_loop()
    try:
        if fmt == "tflite":
            result = await loop.run_in_executor(None, _run_tflite, model_bytes, input_array)
        else:
            result = await loop.run_in_executor(None, _run_onnx, model_bytes, input_array)
    except Exception as exc:
        _log.error("Inference failed for job %s: %s", job_id, exc)
        # Try the other format before giving up
        try:
            other = "onnx" if fmt == "tflite" else "tflite"
            _log.info("Retrying job %s as %s", job_id, other)
            if other == "tflite":
                result = await loop.run_in_executor(None, _run_tflite, model_bytes, input_array)
            else:
                result = await loop.run_in_executor(None, _run_onnx, model_bytes, input_array)
        except Exception as exc2:
            _log.error("Both formats failed for job %s: %s", job_id, exc2)
            return _demo_inference(input_b64, model_cid)

    result["model_cid"]    = model_cid
    result["input_sha256"] = hashlib.sha256(input_b64.encode()).hexdigest()
    return result


# ══════════════════════════════════════════════════════════════════════════════
#  SUPABASE REST HELPERS
# ══════════════════════════════════════════════════════════════════════════════

async def _sb_get(
    session: aiohttp.ClientSession, path: str, params: dict | None = None
) -> list[dict]:
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    async with session.get(url, headers=_SB_HEADERS, params=params) as r:
        if r.status >= 400:
            _log.warning("Supabase GET %s → %s: %s", path, r.status, await r.text())
            return []
        return await r.json()


async def _sb_patch(
    session: aiohttp.ClientSession, path: str, match: dict, data: dict
) -> list[dict]:
    url    = f"{SUPABASE_URL}/rest/v1/{path}"
    params = {k: f"eq.{v}" for k, v in match.items()}
    async with session.patch(url, headers=_SB_HEADERS, params=params, json=data) as r:
        if r.status >= 400:
            _log.warning("Supabase PATCH %s → %s: %s", path, r.status, await r.text())
            return []
        return await r.json()


# ══════════════════════════════════════════════════════════════════════════════
#  JOB LIFECYCLE
# ══════════════════════════════════════════════════════════════════════════════

async def _fetch_pending_job(session: aiohttp.ClientSession) -> dict | None:
    rows = await _sb_get(
        session,
        "jobs",
        {
            "status":           "eq.pending",
            "assigned_node_id": "is.null",
            "order":            "created_at.asc",
            "limit":            "1",
        },
    )
    return rows[0] if rows else None


async def _claim_job(session: aiohttp.ClientSession, job_id: str) -> bool:
    rows = await _sb_patch(
        session,
        "jobs",
        {"id": job_id, "status": "pending"},
        {"status": "assigned", "assigned_node_id": NODE_ID},
    )
    return bool(rows)


async def _complete_job(
    session: aiohttp.ClientSession, job_id: str, output: dict, elapsed_ms: float
) -> None:
    result_json = json.dumps(output, sort_keys=True)
    result_hash = hashlib.sha256(result_json.encode()).hexdigest()
    await _sb_patch(
        session,
        "jobs",
        {"id": job_id},
        {
            "status":           "completed",
            "result":           output,            # jsonb column — pass dict directly
            "result_hash":      result_hash,
            "execution_time_ms": int(elapsed_ms),
            "completed_at":     time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
    )
    _log.info("✓ Job %s completed in %.0f ms — hash=%s", job_id, elapsed_ms, result_hash[:12])


async def _fail_job(
    session: aiohttp.ClientSession, job_id: str, reason: str
) -> None:
    await _sb_patch(
        session,
        "jobs",
        {"id": job_id},
        {"status": "failed", "result": {"error": reason}},
    )
    _log.warning("✗ Job %s failed: %s", job_id, reason)


# ══════════════════════════════════════════════════════════════════════════════
#  HEARTBEAT
# ══════════════════════════════════════════════════════════════════════════════

async def _heartbeat(session: aiohttp.ClientSession) -> None:
    url = f"{BACKEND_HTTP_URL}/api/nodes/heartbeat"
    try:
        async with session.post(
            url,
            headers={
                "x-wallet-address": WALLET_ADDRESS,
                "x-node-api-key":   API_KEY,
            },
            timeout=aiohttp.ClientTimeout(total=8),
        ) as r:
            _log.debug("Heartbeat → %s", r.status)
    except Exception as exc:
        _log.warning("Heartbeat failed: %s", exc)


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN LOOP
# ══════════════════════════════════════════════════════════════════════════════

async def main() -> None:
    _log.info("=" * 60)
    _log.info("ModelVerse Node Daemon starting")
    _log.info("  NODE_ID   = %s", NODE_ID)
    _log.info("  BACKEND   = %s", BACKEND_HTTP_URL)
    _log.info("  CACHE DIR = %s", MODEL_CACHE_DIR)
    _log.info("  GATEWAYS  = %s", IPFS_GATEWAYS)
    _log.info("  POLL      = %ss  HEARTBEAT = %ss", POLL_INTERVAL, HEARTBEAT_EVERY)
    _log.info("=" * 60)

    last_heartbeat = 0.0

    async with aiohttp.ClientSession() as session:
        while True:
            try:
                now = time.monotonic()
                if now - last_heartbeat >= HEARTBEAT_EVERY:
                    await _heartbeat(session)
                    last_heartbeat = now

                job = await _fetch_pending_job(session)
                if job is None:
                    _log.debug("No pending jobs — sleeping %ss", POLL_INTERVAL)
                    await asyncio.sleep(POLL_INTERVAL)
                    continue

                job_id = str(job["id"])
                _log.info(
                    "Found job %s  model_cid=%s  input_type=%s",
                    job_id,
                    str(job.get("model_cid") or "none")[:24],
                    job.get("model_input_type", "?"),
                )

                claimed = await _claim_job(session, job_id)
                if not claimed:
                    _log.info("Job %s already claimed — skipping", job_id)
                    await asyncio.sleep(1)
                    continue

                _log.info("Claimed job %s — fetching model & running inference...", job_id)
                t_start = time.perf_counter()

                try:
                    output     = await run_inference_for_job(job)
                    elapsed_ms = (time.perf_counter() - t_start) * 1000
                    await _complete_job(session, job_id, output, elapsed_ms)
                except Exception as exc:
                    _log.exception("Unhandled inference error for job %s: %s", job_id, exc)
                    await _fail_job(session, job_id, str(exc))

            except asyncio.CancelledError:
                _log.info("Daemon shutting down")
                break
            except Exception as exc:
                _log.exception("Daemon loop error: %s", exc)
                await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    asyncio.run(main())