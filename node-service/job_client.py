"""WebSocket job client for coordinator-driven node assignments."""

from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import os
from dataclasses import dataclass
from enum import Enum
from typing import Any, Optional
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import aiohttp
from PIL import Image
from pydantic import BaseModel, Field

from logger import get_logger

_log = get_logger(__name__)


class JobStatus(str, Enum):
    PENDING = "pending"
    ASSIGNED = "assigned"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Job:
    job_id: str
    model_id: str
    buyer_address: str
    input_data_url: str
    payment_amount: float
    status: JobStatus = JobStatus.PENDING
    blockchain_job_id: Optional[int] = None
    assigned_node_id: Optional[str] = None


@dataclass
class BidRequest:
    job_id: str
    node_id: str
    estimated_time_ms: int
    reputation_score: float = 0.5


@dataclass
class ResultPayload:
    job_id: str
    result_hash: str
    result_url: str
    execution_time_ms: int


class JobPayload(BaseModel):
    job_id: int
    model_cid: str
    model_input_type: str
    input_base64: str = ""
    input_url: str | None = None
    creator_address: str


def decode_input_image(job: JobPayload) -> Image.Image:
    """Decode base64 image into PIL.Image for model inference."""
    if not job.input_base64:
        raise ValueError("input_base64 missing in job payload")

    try:
        raw = base64.b64decode(job.input_base64)
        image = Image.open(io.BytesIO(raw))
        image.load()
        return image
    except Exception as exc:  # noqa: BLE001
        raise ValueError(f"Failed to decode input image: {exc}") from exc


class JobClient:
    def __init__(
        self,
        ws_url: str | None = None,
        auth_token: str | None = None,
        logger: logging.Logger | None = None,
        *legacy_args: Any,
        base_url: str | None = None,
        node_id: str | None = None,
        api_key: str | None = None,
    ) -> None:
        # Legacy compatibility: JobClient(base_url, node_id, api_key)
        # and JobClient(base_url=..., node_id=..., api_key=...)
        resolved_url = ws_url or base_url
        if not resolved_url:
            raise ValueError("ws_url or base_url is required")

        if legacy_args:
            if len(legacy_args) >= 2 and isinstance(legacy_args[1], str):
                auth_token = legacy_args[1]
            elif len(legacy_args) >= 1 and isinstance(legacy_args[0], str) and auth_token is None:
                auth_token = legacy_args[0]

        if auth_token is None and api_key:
            auth_token = api_key

        self.ws_url = resolved_url.rstrip("/")
        self.auth_token = auth_token
        self.auth_mode = os.getenv("COORDINATOR_AUTH_MODE", "header").strip().lower() or "header"
        self.log = logger or _log
        self.node_id = node_id

        self._session: aiohttp.ClientSession | None = None
        self._ws: aiohttp.ClientWebSocketResponse | None = None

    async def connect(self) -> None:
        if self._session is not None and self._ws is not None and not self._ws.closed:
            return

        url, headers = _build_ws_auth(self.ws_url, self.auth_token, self.auth_mode)
        self._session = aiohttp.ClientSession()
        self._ws = await self._session.ws_connect(url, headers=headers)
        self.log.info("Connected to coordinator websocket: %s", url)

    async def close(self) -> None:
        if self._ws is not None and not self._ws.closed:
            await self._ws.close()
        if self._session is not None:
            await self._session.close()
        self._ws = None
        self._session = None

    async def next_job(self, timeout: float | None = None) -> JobPayload | None:
        if self._ws is None:
            raise RuntimeError("JobClient is not connected")

        async def _receive() -> dict[str, Any]:
            if hasattr(self._ws, "receive_json"):
                return await self._ws.receive_json()
            message = await self._ws.receive()
            if message.type == aiohttp.WSMsgType.TEXT:
                return json.loads(message.data)
            raise RuntimeError(f"Unexpected WS message type: {message.type}")

        try:
            payload = await asyncio.wait_for(_receive(), timeout=timeout) if timeout is not None else await _receive()
        except asyncio.TimeoutError:
            return None

        msg_type = str(payload.get("type", "job")).lower()
        if msg_type not in {"job", "job_assigned", "assignment"}:
            return None

        normalized = payload.get("job", payload)
        return JobPayload.model_validate(normalized)

    async def send_result(self, job_id: int, output: dict[str, Any]) -> None:
        if self._ws is None:
            raise RuntimeError("JobClient is not connected")

        message = {
            "type": "job_result",
            "job_id": job_id,
            "output": output,
        }
        await self._ws.send_json(message)

    # Legacy stubs retained for existing tests/callers.
    async def fetch_pending_jobs(self, limit: int = 10) -> list[Job]:
        _ = limit
        return []

    async def submit_bid(self, bid: BidRequest) -> bool:
        _ = bid
        return False

    async def fetch_assigned_jobs(self) -> list[Job]:
        return []

    async def post_result(self, result: ResultPayload) -> bool:
        _ = result
        return False

    async def send_heartbeat(self) -> None:
        return


def _build_ws_auth(ws_url: str, auth_token: str | None, auth_mode: str) -> tuple[str, dict[str, str] | None]:
    if not auth_token:
        return ws_url, None

    if auth_mode == "query":
        parsed = urlparse(ws_url)
        query_items = dict(parse_qsl(parsed.query))
        query_items["token"] = auth_token
        updated = parsed._replace(query=urlencode(query_items))
        return urlunparse(updated), None

    headers = {"Authorization": f"Bearer {auth_token}"}
    return ws_url, headers
