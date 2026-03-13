#backend_client.py
from __future__ import annotations

import logging
from dataclasses import dataclass

import aiohttp


@dataclass
class NodeRegistrationInfo:
    node_id: str
    api_key: str


class BackendClient:
    def __init__(self, base_url: str, wallet_address: str, logger: logging.Logger) -> None:
        self.base_url = base_url.rstrip("/")
        self.wallet_address = wallet_address
        self.log = logger

    async def register_node(self) -> NodeRegistrationInfo:
        """
        POST /api/nodes/register with x-wallet-address header.

        On success, return NodeRegistrationInfo(node_id, api_key).
        Raise a descriptive exception on non-2xx HTTP status.
        """
        url = f"{self.base_url}/api/nodes/register"
        headers = {"x-wallet-address": self.wallet_address}

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers) as response:
                if response.status < 200 or response.status >= 300:
                    body = await response.text()
                    self.log.error("Node registration failed status=%s body=%s", response.status, body)
                    raise RuntimeError(
                        f"Node registration failed with HTTP {response.status}: {body}"
                    )

                payload = await response.json()

        node_id = str(payload.get("node_id", "")).strip()
        api_key = str(payload.get("api_key", "")).strip()
        if not node_id or not api_key:
            raise RuntimeError("Node registration response missing node_id/api_key")

        self.log.info("Node registration successful: node_id=%s", node_id)
        return NodeRegistrationInfo(node_id=node_id, api_key=api_key)
