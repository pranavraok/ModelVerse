from __future__ import annotations

from typing import Any

from web3 import Web3

from contracts.job_manager_client import JobManagerClient


class _FakeFunctionCall:
    def __init__(self, args: tuple[Any, ...]) -> None:
        self.args = args

    def build_transaction(self, tx: dict[str, Any]) -> dict[str, Any]:
        built = dict(tx)
        built["_args"] = self.args
        return built


class _FakeFunctions:
    def settleJob(self, job_id: int, node_address: str, creator_address: str) -> _FakeFunctionCall:
        return _FakeFunctionCall((job_id, node_address, creator_address))


class _FakeContract:
    def __init__(self) -> None:
        self.functions = _FakeFunctions()


class _FakeEth:
    def contract(self, address: str, abi: list[dict[str, Any]]) -> _FakeContract:
        _ = (address, abi)
        return _FakeContract()


class _FakeWeb3:
    def __init__(self) -> None:
        self.eth = _FakeEth()


def test_build_settle_job_tx_sets_from_and_args(monkeypatch) -> None:
    monkeypatch.setattr(JobManagerClient, "_load_abi", staticmethod(lambda: []))

    client = JobManagerClient(_FakeWeb3(), "0x1111111111111111111111111111111111111111")
    tx = client.build_settle_job_tx(
        from_address="0x2222222222222222222222222222222222222222",
        job_id=7,
        node_address="0x3333333333333333333333333333333333333333",
        creator_address="0x4444444444444444444444444444444444444444",
    )

    assert tx["from"] == Web3.to_checksum_address("0x2222222222222222222222222222222222222222")
    assert tx["_args"] == (
        7,
        Web3.to_checksum_address("0x3333333333333333333333333333333333333333"),
        Web3.to_checksum_address("0x4444444444444444444444444444444444444444"),
    )
