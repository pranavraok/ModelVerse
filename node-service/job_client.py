"""
job_client.py – Backend job-queue client for ModelVerse node-service.

Provides typed dataclasses representing the job lifecycle and async
helper stubs for interacting with the coordinator backend (Supabase REST
or a custom FastAPI service).

No real HTTP calls yet — correct type signatures and structure are in
place so the daemon and tests can import cleanly.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional

import httpx

from logger import get_logger

_log = get_logger(__name__)


# ── Enums & data models ───────────────────────────────────────────────────────

class JobStatus(str, Enum):
    PENDING   = "pending"
    ASSIGNED  = "assigned"
    COMPLETED = "completed"
    FAILED    = "failed"


@dataclass
class Job:
    """Represents a single inference job received from the coordinator."""

    job_id: str
    model_id: str
    buyer_address: str
    input_data_url: str          # IPFS or HTTPS URL for the input payload
    payment_amount: float        # MATIC
    status: JobStatus = JobStatus.PENDING
    blockchain_job_id: Optional[int] = None   # On-chain job counter ID
    assigned_node_id: Optional[str] = None


@dataclass
class BidRequest:
    """Payload sent to the coordinator when this node bids on a job."""

    job_id: str
    node_id: str
    estimated_time_ms: int
    reputation_score: float = 0.5


@dataclass
class ResultPayload:
    """Payload posted once inference is complete."""

    job_id: str
    result_hash: str       # SHA-256 hex of the result JSON
    result_url: str        # IPFS URI of the full result
    execution_time_ms: int


# ── Client ────────────────────────────────────────────────────────────────────

class JobClient:
    """
    Async client for the ModelVerse coordinator backend.

    Args:
        base_url: REST base URL of the backend (read from ``COORDINATOR_WS_URL``
                  or a dedicated ``BACKEND_URL`` env var in Phase 2).
        node_id:  This node's unique identifier.
        api_key:  Backend API key for authenticated requests.
    """

    def __init__(
        self,
        base_url: str,
        node_id: str,
        api_key: str,
    ) -> None:
        self._base_url = base_url.rstrip("/")
        self._node_id = node_id
        self._api_key = api_key
        self._headers: dict[str, str] = {
            "apikey": api_key,
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        _log.debug("JobClient ready – base_url=%s, node_id=%s", self._base_url, node_id)

    # ── Public methods ────────────────────────────────────────────────────────

    async def fetch_pending_jobs(self, limit: int = 10) -> list[Job]:
        """
        Poll the backend for open jobs this node could bid on.

        Args:
            limit: Maximum number of jobs to retrieve per poll.

        Returns:
            A list of :class:`Job` objects (currently always empty stub).

        Note:
            Full implementation (httpx.AsyncClient GET request) pending Phase 2.
        """
        _log.debug("fetch_pending_jobs – limit=%d (stub, returning [])", limit)
        # TODO: GET {base_url}/rest/v1/jobs?status=eq.pending&limit={limit}
        return []

    async def submit_bid(self, bid: BidRequest) -> bool:
        """
        Send a bid for the given job to the coordinator.

        Args:
            bid: Populated :class:`BidRequest` dataclass.

        Returns:
            ``True`` if the bid was accepted (HTTP 201), else ``False``.
        """
        _log.debug("submit_bid – job_id=%s estimated_ms=%d (stub)", bid.job_id, bid.estimated_time_ms)
        # TODO: POST {base_url}/rest/v1/job_bids with bid payload
        return False

    async def fetch_assigned_jobs(self) -> list[Job]:
        """
        Retrieve jobs that have been assigned to *this* node.

        Returns:
            A list of assigned :class:`Job` objects.
        """
        _log.debug("fetch_assigned_jobs – node_id=%s (stub, returning [])", self._node_id)
        # TODO: GET /rest/v1/jobs?status=eq.assigned&assigned_node_id=eq.{node_id}
        return []

    async def post_result(self, result: ResultPayload) -> bool:
        """
        Upload execution metadata once inference finishes.

        Args:
            result: Populated :class:`ResultPayload` dataclass.

        Returns:
            ``True`` on successful delivery.
        """
        _log.debug("post_result – job_id=%s hash=%s (stub)", result.job_id, result.result_hash[:8])
        # TODO: POST {base_url}/api/jobs/{job_id}/result
        return False

    async def send_heartbeat(self) -> None:
        """POST a liveness ping so the backend marks this node as online."""
        _log.debug("send_heartbeat – node_id=%s (stub)", self._node_id)
        # TODO: POST {base_url}/api/nodes/{node_id}/heartbeat
