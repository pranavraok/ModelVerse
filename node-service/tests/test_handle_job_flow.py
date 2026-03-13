from __future__ import annotations

import base64
import hashlib
import io
import os

import pytest
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from PIL import Image

from job_client import JobPayload
from node_daemon import handle_job


def _image_b64() -> str:
    image = Image.new("RGB", (16, 16), color="red")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return base64.b64encode(buffer.getvalue()).decode("utf-8")


def _encrypt_for_job(raw_base64: str, job_id: str | int) -> str:
    salt = str(job_id).encode()
    password = os.getenv("NODE_PRIVATE_KEY", "dummy_key").encode()
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password))
    fernet = Fernet(key)
    raw_bytes = base64.b64decode(raw_base64)
    return base64.b64encode(fernet.encrypt(raw_bytes)).decode("utf-8")


@pytest.mark.asyncio
async def test_handle_job_flow(monkeypatch: pytest.MonkeyPatch) -> None:
    sent_results: list[tuple[int, dict]] = []
    settle_calls: list[tuple[str, list[tuple[int, float]], str]] = []

    class FakeWallet:
        address = "0x2222222222222222222222222222222222222222"

    class FakeJobManager:
        def build_settle_job_tx(self, from_address: str, job_id: int, node_address: str, creator_address: str):
            return {
                "from": from_address,
                "job_id": job_id,
                "node": node_address,
                "creator": creator_address,
            }

    class FakeEngine:
        class _Cache:
            async def get_or_fetch(self, cid: str, fetcher):
                _ = cid
                model_bytes = await fetcher("ignored")
                assert isinstance(model_bytes, bytes)
                return object()

        cache = _Cache()

        async def load_session(self, cid: str):
            _ = cid
            return object()

        async def classify_image(self, cid: str, image: Image.Image, input_name: str, top_k: int = 3):
            _ = (cid, image, input_name, top_k)
            return [(1, 0.7), (0, 0.2), (2, 0.1)]

    class FakeJobClient:
        async def send_result(self, job_id: int, output: dict):
            sent_results.append((job_id, output))

    model_bytes = b"\x00" * 32
    model_hash = hashlib.sha256(model_bytes).hexdigest()
    monkeypatch.setattr("node_daemon.fetch_ipfs_file", lambda cid: _fake_fetch(cid, model_bytes))
    monkeypatch.setattr("node_daemon.settle_job", lambda job_id, results, wallet: _fake_settle(job_id, results, wallet, settle_calls))

    job_id = "101"
    job = JobPayload(
        job_id=job_id,
        model_cid="QmDummyModel",
        model_hash=model_hash,
        model_input_type="image",
        input_base64=_encrypt_for_job(_image_b64(), job_id),
        creator_address="0x4444444444444444444444444444444444444444",
    )

    await handle_job(FakeWallet(), FakeJobManager(), FakeEngine(), FakeJobClient(), job)

    assert len(settle_calls) == 1
    assert len(sent_results) == 1
    sent_job_id, payload = sent_results[0]
    assert str(sent_job_id) == "101"
    assert payload["top_k"] == [
        {"class_index": 1, "prob": 0.7},
        {"class_index": 0, "prob": 0.2},
        {"class_index": 2, "prob": 0.1},
    ]


async def _fake_fetch(_: str, model_bytes: bytes) -> bytes:
    return model_bytes


async def _fake_settle(
    job_id: str | int,
    results: list[tuple[int, float]],
    wallet: str,
    calls: list[tuple[str, list[tuple[int, float]], str]],
) -> str:
    calls.append((str(job_id), results, wallet))
    return "0xmock123"
