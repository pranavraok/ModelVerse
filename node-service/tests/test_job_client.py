from __future__ import annotations

import base64
import io
import os

import pytest
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from PIL import Image

from job_client import JobClient, JobPayload, decode_input_image


def _make_red_image_base64() -> str:
    image = Image.new("RGB", (8, 8), color="red")
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


def test_job_payload_parsing() -> None:
    raw_b64 = _make_red_image_base64()
    job_id = "123"
    payload = JobPayload.model_validate(
        {
            "job_id": job_id,
            "model_cid": "QmModelCid",
            "model_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "model_input_type": "image",
            "input_base64": _encrypt_for_job(raw_b64, job_id),
            "creator_address": "0x2222222222222222222222222222222222222222",
        }
    )

    assert payload.job_id == "123"
    assert payload.model_cid == "QmModelCid"
    assert payload.model_hash is not None
    assert payload.model_input_type == "image"


def test_decode_input_image() -> None:
    raw_b64 = _make_red_image_base64()
    job_id = "1"
    job = JobPayload(
        job_id=job_id,
        model_cid="QmModelCid",
        model_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        model_input_type="image",
        input_base64=_encrypt_for_job(raw_b64, job_id),
        creator_address="0x2222222222222222222222222222222222222222",
    )

    image = decode_input_image(job)
    assert image.mode == "RGB"
    assert image.size == (8, 8)


@pytest.mark.asyncio
async def test_job_client_next_job_and_send_result(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict = {}

    class FakeWS:
        def __init__(self) -> None:
            self.sent_messages: list[dict] = []

        async def receive_json(self) -> dict:
            job_id = "55"
            return {
                "type": "job_assigned",
                "job": {
                    "job_id": job_id,
                    "model_cid": "QmX",
                    "model_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                    "model_input_type": "image",
                    "input_base64": _encrypt_for_job(_make_red_image_base64(), job_id),
                    "creator_address": "0x3333333333333333333333333333333333333333",
                },
            }

        async def send_json(self, message: dict) -> None:
            self.sent_messages.append(message)

        @property
        def closed(self) -> bool:
            return False

        async def close(self) -> None:
            return None

    class FakeSession:
        def __init__(self) -> None:
            self.ws = FakeWS()

        async def ws_connect(self, url: str, headers=None):
            captured["url"] = url
            captured["headers"] = headers or {}
            return self.ws

        async def close(self) -> None:
            return None

    fake_session = FakeSession()
    monkeypatch.setattr("job_client.aiohttp.ClientSession", lambda: fake_session)
    monkeypatch.setenv("COORDINATOR_AUTH_MODE", "header")
    monkeypatch.setenv("COORDINATOR_AUTH_TOKEN", "test-api-key")
    monkeypatch.setenv("BACKEND_API_KEY_HEADER", "x-node-api-key")

    client = JobClient(
        "ws://localhost:8000/ws/jobs",
        "test-api-key",
        wallet_address="0x2222222222222222222222222222222222222222",
    )
    await client.connect()

    assert captured["headers"]["x-wallet-address"] == "0x2222222222222222222222222222222222222222"
    assert captured["headers"]["x-node-api-key"] == "test-api-key"

    job = await client.next_job()
    assert job is not None
    assert str(job.job_id) == "55"

    await client.send_result(55, {"ok": True})
    assert fake_session.ws.sent_messages == [
        {"type": "job_result", "job_id": 55, "output": {"ok": True}}
    ]

    await client.close()
