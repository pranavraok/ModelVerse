from __future__ import annotations

import pytest

from node_capabilities import NodeCapabilities
from node_daemon import send_heartbeat


@pytest.mark.asyncio
async def test_send_heartbeat_http_post(monkeypatch: pytest.MonkeyPatch) -> None:
    seen: dict = {}

    class FakeResponse:
        status = 200

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            _ = (exc_type, exc, tb)

        async def json(self):
            return {"ok": True}

        async def text(self):
            return "ok"

    class FakeSession:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            _ = (exc_type, exc, tb)

        def post(self, url: str, headers: dict[str, str], timeout):
            seen["url"] = url
            seen["headers"] = headers
            _ = timeout
            return FakeResponse()

    monkeypatch.setenv("BACKEND_HTTP_URL", "http://example")
    monkeypatch.setenv("NODE_API_KEY", "test-key")
    monkeypatch.setattr("node_daemon.aiohttp.ClientSession", FakeSession)

    capabilities = NodeCapabilities(
        gpu=False,
        gpu_memory_gb=0,
        supported_tasks=["image-classification"],
        max_concurrent_jobs=1,
        region="IN-BLR",
    )

    await send_heartbeat("0x2222222222222222222222222222222222222222", capabilities)
    assert seen["url"] == "http://example/api/nodes/heartbeat"
    assert seen["headers"]["x-wallet-address"] == "0x2222222222222222222222222222222222222222"
    assert seen["headers"]["x-node-api-key"] == "test-key"
