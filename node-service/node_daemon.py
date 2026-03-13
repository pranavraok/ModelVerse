"""
node_daemon.py — Single-node auto-demo daemon.

Flow:
  1. On start: read NODE_ID + API_KEY from env (written by entrypoint.sh).
  2. Loop every POLL_INTERVAL seconds:
       a. POST /api/nodes/heartbeat
       b. GET pending jobs from Supabase REST (FCFS: ORDER BY created_at ASC LIMIT 1)
       c. Atomically claim job (UPDATE status='assigned' WHERE status='pending')
       d. Execute inference (ONNX / TFLite stub)
       e. POST result back to Supabase + backend
  3. No bidding. No WebSocket for job assignment. Single node owns everything.
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
from dotenv import load_dotenv

# ── logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG if os.getenv("LOG_LEVEL", "INFO").upper() == "DEBUG" else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
_log = logging.getLogger("node_daemon")

# ── env ───────────────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / ".env", override=False)

SUPABASE_URL      = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY      = os.environ["SUPABASE_SERVICE_KEY"]   # service-role key
NODE_ID           = os.environ["NODE_ID"]
API_KEY           = os.environ["NODE_API_KEY"]
BACKEND_HTTP_URL  = os.getenv("BACKEND_HTTP_URL", "http://localhost:8000").rstrip("/")
POLL_INTERVAL     = int(os.getenv("POLL_INTERVAL_SECONDS", "5"))
HEARTBEAT_EVERY   = int(os.getenv("HEARTBEAT_INTERVAL_SECONDS", "30"))

_SB_HEADERS = {
    "apikey":        SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type":  "application/json",
    "Prefer":        "return=representation",
}

# ── fake inference (replace with real ONNX when model is ready) ───────────────
def _run_inference(input_base64: str, model_cid: str) -> dict[str, Any]:
    """
    Demo inference: decode base64 input → compute SHA-256 → return fake credit score.
    Replace this function body with your real ONNX/TFLite call.
    """
    try:
        raw = base64.b64decode(input_base64)
    except Exception:
        raw = input_base64.encode()

    digest = hashlib.sha256(raw).hexdigest()
    # Deterministic fake score so demo is reproducible
    score = 0.5 + (int(digest[:4], 16) / 65535) * 0.49
    return {
        "credit_score":  round(score, 4),
        "model_cid":     model_cid,
        "input_sha256":  digest,
        "latency_ms":    42,
    }


# ── Supabase REST helpers ─────────────────────────────────────────────────────
async def _sb_get(session: aiohttp.ClientSession, path: str, params: dict | None = None) -> list[dict]:
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    async with session.get(url, headers=_SB_HEADERS, params=params) as r:
        if r.status >= 400:
            text = await r.text()
            _log.warning("Supabase GET %s → %s: %s", path, r.status, text)
            return []
        return await r.json()


async def _sb_patch(session: aiohttp.ClientSession, path: str, match: dict, data: dict) -> list[dict]:
    url = f"{SUPABASE_URL}/rest/v1/{path}"
    params = {k: f"eq.{v}" for k, v in match.items()}
    async with session.patch(url, headers=_SB_HEADERS, params=params, json=data) as r:
        if r.status >= 400:
            text = await r.text()
            _log.warning("Supabase PATCH %s → %s: %s", path, r.status, text)
            return []
        return await r.json()


# ── heartbeat ─────────────────────────────────────────────────────────────────
async def _heartbeat(session: aiohttp.ClientSession) -> None:
    url = f"{BACKEND_HTTP_URL}/api/nodes/heartbeat"
    headers = {
        "x-wallet-address": os.getenv("WALLET_ADDRESS", ""),
        "x-node-api-key":   API_KEY,
    }
    try:
        async with session.post(url, headers=headers, timeout=aiohttp.ClientTimeout(total=8)) as r:
            _log.debug("Heartbeat → %s", r.status)
    except Exception as exc:
        _log.warning("Heartbeat failed: %s", exc)


# ── fetch oldest pending job (FCFS) ──────────────────────────────────────────
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


# ── atomically claim a job ────────────────────────────────────────────────────
async def _claim_job(session: aiohttp.ClientSession, job_id: str) -> bool:
    """
    UPDATE jobs SET status='assigned', assigned_node_id=NODE_ID
    WHERE id=job_id AND status='pending'
    Returns True if we won the race.
    """
    rows = await _sb_patch(
        session,
        "jobs",
        {"id": job_id, "status": "pending"},   # WHERE clause
        {"status": "assigned", "assigned_node_id": NODE_ID},
    )
    return bool(rows)


# ── write result back ─────────────────────────────────────────────────────────
async def _complete_job(session: aiohttp.ClientSession, job_id: str, output: dict) -> None:
    result_json   = json.dumps(output, sort_keys=True)
    result_hash   = hashlib.sha256(result_json.encode()).hexdigest()

    await _sb_patch(
        session,
        "jobs",
        {"id": job_id},
        {
            "status":      "completed",
            "result":      result_json,
            "result_hash": result_hash,
            "completed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        },
    )
    _log.info("Job %s completed — result_hash=%s", job_id, result_hash[:12])


# ── mark job failed ───────────────────────────────────────────────────────────
async def _fail_job(session: aiohttp.ClientSession, job_id: str, reason: str) -> None:
    await _sb_patch(
        session,
        "jobs",
        {"id": job_id},
        {"status": "failed", "result": json.dumps({"error": reason})},
    )
    _log.warning("Job %s marked failed: %s", job_id, reason)


# ── main loop ─────────────────────────────────────────────────────────────────
async def main() -> None:
    _log.info("=" * 60)
    _log.info("ModelVerse Node Daemon starting")
    _log.info("  NODE_ID  = %s", NODE_ID)
    _log.info("  BACKEND  = %s", BACKEND_HTTP_URL)
    _log.info("  POLL     = %ss  HEARTBEAT = %ss", POLL_INTERVAL, HEARTBEAT_EVERY)
    _log.info("=" * 60)

    last_heartbeat = 0.0

    async with aiohttp.ClientSession() as session:
        while True:
            try:
                # ── heartbeat (rate-limited) ──────────────────────────────
                now = time.monotonic()
                if now - last_heartbeat >= HEARTBEAT_EVERY:
                    await _heartbeat(session)
                    last_heartbeat = now

                # ── poll Supabase for oldest pending job ──────────────────
                job = await _fetch_pending_job(session)
                if job is None:
                    _log.debug("No pending jobs — sleeping %ss", POLL_INTERVAL)
                    await asyncio.sleep(POLL_INTERVAL)
                    continue

                job_id    = str(job["id"])
                model_cid = str(job.get("model_cid") or "demo-cid")
                input_b64 = str(job.get("input_base64") or job.get("input_data_url") or "")

                _log.info("Found pending job: %s  model_cid=%s", job_id, model_cid[:20])

                # ── atomically claim it (FCFS — first PATCH wins) ─────────
                claimed = await _claim_job(session, job_id)
                if not claimed:
                    _log.info("Job %s already claimed by another process — skipping", job_id)
                    await asyncio.sleep(1)
                    continue

                _log.info("Claimed job %s — running inference...", job_id)

                # ── run inference ─────────────────────────────────────────
                try:
                    loop   = asyncio.get_event_loop()
                    output = await loop.run_in_executor(
                        None, _run_inference, input_b64, model_cid
                    )
                    await _complete_job(session, job_id, output)
                except Exception as exc:
                    _log.exception("Inference failed for job %s: %s", job_id, exc)
                    await _fail_job(session, job_id, str(exc))

            except asyncio.CancelledError:
                _log.info("Daemon shutting down cleanly")
                break
            except Exception as exc:
                _log.exception("Daemon loop error: %s", exc)
                await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    asyncio.run(main())