from __future__ import annotations

import pytest

from backend_client import BackendClient


@pytest.mark.asyncio
async def test_register_node_success(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeResponse:
        status = 200

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            _ = (exc_type, exc, tb)

        async def json(self):
            return {"node_id": "123", "api_key": "abc"}

        async def text(self):
            return "ok"

    class FakeSession:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            _ = (exc_type, exc, tb)

        def post(self, url: str, headers: dict[str, str]):
            assert url.endswith("/api/nodes/register")
            assert headers["x-wallet-address"] == "0x2222222222222222222222222222222222222222"
            return FakeResponse()

    monkeypatch.setattr("backend_client.aiohttp.ClientSession", lambda: FakeSession())

    import logging

    client = BackendClient(
        base_url="http://127.0.0.1:8000",
        wallet_address="0x2222222222222222222222222222222222222222",
        logger=logging.getLogger("test"),
    )

    info = await client.register_node()
    assert info.node_id == "123"
    assert info.api_key == "abc"
