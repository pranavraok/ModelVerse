from __future__ import annotations

import base64
import io

import pytest
from PIL import Image

from job_client import JobPayload
from node_daemon import handle_job


def _image_b64() -> str:
    image = Image.new("RGB", (16, 16), color="red")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


@pytest.mark.asyncio
async def test_handle_job_flow(monkeypatch: pytest.MonkeyPatch) -> None:
    sent_txs: list[dict] = []
    sent_results: list[tuple[int, dict]] = []

    class FakeHash:
        def hex(self) -> str:
            return "0xabc"

    class FakeReceipt:
        transactionHash = FakeHash()
        status = 1

    class FakeWallet:
        address = "0x2222222222222222222222222222222222222222"

        def build_and_send_tx(self, tx):
            sent_txs.append(tx)
            return FakeReceipt()

    class FakeJobManager:
        def build_settle_job_tx(self, from_address: str, job_id: int, node_address: str, creator_address: str):
            return {
                "from": from_address,
                "job_id": job_id,
                "node": node_address,
                "creator": creator_address,
            }

    class FakeEngine:
        async def classify_image(self, cid: str, image: Image.Image, input_name: str, top_k: int = 3):
            _ = (cid, image, input_name, top_k)
            return [(1, 0.7), (0, 0.2), (2, 0.1)]

    class FakeJobClient:
        async def send_result(self, job_id: int, output: dict):
            sent_results.append((job_id, output))

    job = JobPayload(
        job_id=101,
        model_cid="QmDummyModel",
        model_input_type="image",
        input_base64=_image_b64(),
        creator_address="0x4444444444444444444444444444444444444444",
    )

    await handle_job(FakeWallet(), FakeJobManager(), FakeEngine(), FakeJobClient(), job)

    assert len(sent_txs) == 1
    assert len(sent_results) == 1
    sent_job_id, payload = sent_results[0]
    assert sent_job_id == 101
    assert payload["top_k"] == [
        {"class_index": 1, "prob": 0.7},
        {"class_index": 0, "prob": 0.2},
        {"class_index": 2, "prob": 0.1},
    ]
