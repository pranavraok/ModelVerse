from __future__ import annotations

import json

import pytest

from node_capabilities import NodeCapabilities
from node_daemon import send_heartbeat


@pytest.mark.asyncio
async def test_send_heartbeat_ws_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    sent_payloads: list[dict] = []

    class FakeWS:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            _ = (exc_type, exc, tb)

        async def send_str(self, payload: str) -> None:
            sent_payloads.append(json.loads(payload))

    class FakeSession:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            _ = (exc_type, exc, tb)

        def ws_connect(self, url: str, heartbeat: int = 10):
            _ = (url, heartbeat)
            return FakeWS()

    monkeypatch.setenv("COORDINATOR_WS_URL", "ws://example/ws")
    monkeypatch.setattr("node_daemon.aiohttp.ClientSession", FakeSession)

    capabilities = NodeCapabilities(
        gpu=False,
        gpu_memory_gb=0,
        supported_tasks=["image-classification"],
        max_concurrent_jobs=1,
        region="IN-BLR",
    )

    await send_heartbeat("0x2222222222222222222222222222222222222222", capabilities)

    assert len(sent_payloads) == 1
    payload = sent_payloads[0]
    assert payload["type"] == "heartbeat"
    assert payload["address"] == "0x2222222222222222222222222222222222222222"
    assert payload["capabilities"]["supported_tasks"] == ["image-classification"]
