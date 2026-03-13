"""
tests/test_job_flow.py – Unit tests for job_client.py scaffolding

Covers:
  - JobStatus enum values match expected backend strings.
  - Job dataclass defaults are sensible.
  - BidRequest and ResultPayload are well-formed.
  - JobClient stub methods return empty / False without raising.

No real HTTP calls are made.
"""

from __future__ import annotations

import pytest
import pytest_asyncio

from job_client import BidRequest, Job, JobClient, JobStatus, ResultPayload


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture()
def client() -> JobClient:
    return JobClient(
        base_url="https://example-backend.supabase.co",
        node_id="test-node-abc123",
        api_key="test-api-key",
    )


@pytest.fixture()
def sample_job() -> Job:
    return Job(
        job_id="job-uuid-001",
        model_id="credit-scoring-v2",
        buyer_address="0xBuyer000",
        input_data_url="ipfs://QmTestInput",
        payment_amount=5.0,
    )


@pytest.fixture()
def sample_bid() -> BidRequest:
    return BidRequest(
        job_id="job-uuid-001",
        node_id="test-node-abc123",
        estimated_time_ms=450,
        reputation_score=0.75,
    )


@pytest.fixture()
def sample_result() -> ResultPayload:
    return ResultPayload(
        job_id="job-uuid-001",
        result_hash="a" * 64,
        result_url="ipfs://QmTestResult",
        execution_time_ms=312,
    )


# ── JobStatus ─────────────────────────────────────────────────────────────────

class TestJobStatus:
    def test_pending_value(self) -> None:
        assert JobStatus.PENDING.value == "pending"

    def test_completed_value(self) -> None:
        assert JobStatus.COMPLETED.value == "completed"

    def test_failed_value(self) -> None:
        assert JobStatus.FAILED.value == "failed"


# ── Job dataclass ─────────────────────────────────────────────────────────────

class TestJobDataclass:
    def test_default_status(self, sample_job: Job) -> None:
        assert sample_job.status == JobStatus.PENDING

    def test_optional_fields_default_to_none(self, sample_job: Job) -> None:
        assert sample_job.blockchain_job_id is None
        assert sample_job.assigned_node_id is None

    def test_payment_amount(self, sample_job: Job) -> None:
        assert sample_job.payment_amount == pytest.approx(5.0)


# ── BidRequest & ResultPayload ────────────────────────────────────────────────

class TestBidRequest:
    def test_default_reputation(self, sample_bid: BidRequest) -> None:
        assert sample_bid.reputation_score == pytest.approx(0.75)

    def test_fields_set(self, sample_bid: BidRequest) -> None:
        assert sample_bid.job_id == "job-uuid-001"
        assert sample_bid.estimated_time_ms == 450


class TestResultPayload:
    def test_hash_length(self, sample_result: ResultPayload) -> None:
        assert len(sample_result.result_hash) == 64

    def test_url_prefix(self, sample_result: ResultPayload) -> None:
        assert sample_result.result_url.startswith("ipfs://")


# ── JobClient stubs ───────────────────────────────────────────────────────────

class TestJobClientStubs:
    @pytest.mark.asyncio
    async def test_fetch_pending_returns_empty_list(self, client: JobClient) -> None:
        jobs = await client.fetch_pending_jobs()
        assert isinstance(jobs, list)
        assert jobs == []

    @pytest.mark.asyncio
    async def test_submit_bid_returns_false(
        self, client: JobClient, sample_bid: BidRequest
    ) -> None:
        result = await client.submit_bid(sample_bid)
        assert result is False

    @pytest.mark.asyncio
    async def test_fetch_assigned_returns_empty_list(self, client: JobClient) -> None:
        jobs = await client.fetch_assigned_jobs()
        assert isinstance(jobs, list)

    @pytest.mark.asyncio
    async def test_post_result_returns_false(
        self, client: JobClient, sample_result: ResultPayload
    ) -> None:
        ok = await client.post_result(sample_result)
        assert ok is False

    @pytest.mark.asyncio
    async def test_send_heartbeat_does_not_raise(self, client: JobClient) -> None:
        await client.send_heartbeat()  # stub – must not raise
