from __future__ import annotations

from typing import Any

import pytest
from web3 import Web3

from contracts.job_manager_client import JobManagerClient


class _FakeFunctionCall:
    def __init__(self, fn_name: str, args: tuple[Any, ...]) -> None:
        self.fn_name = fn_name
        self.args = args

    def build_transaction(self, tx: dict[str, Any]) -> dict[str, Any]:
        built = dict(tx)
        built["_fn_name"] = self.fn_name
        built["_args"] = self.args
        return built


class _FakeFunctions:
    def registerNode(self, capabilities_json: str) -> _FakeFunctionCall:
        return _FakeFunctionCall("registerNode", (capabilities_json,))

    def depositStake(self, *args: Any) -> _FakeFunctionCall:
        return _FakeFunctionCall("depositStake", args)


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


def test_build_register_node_tx_sets_from_and_payload(monkeypatch: pytest.MonkeyPatch) -> None:
    abi = [{"type": "function", "name": "registerNode", "inputs": [{"name": "capabilitiesJson", "type": "string"}]}]
    monkeypatch.setattr(JobManagerClient, "_load_abi", staticmethod(lambda: abi))

    web3 = _FakeWeb3()
    client = JobManagerClient(web3=web3, address="0x1111111111111111111111111111111111111111")

    tx = client.build_register_node_tx(
        from_address="0x2222222222222222222222222222222222222222",
        capabilities_json='{"gpu":false}',
    )

    assert tx["from"] == Web3.to_checksum_address("0x2222222222222222222222222222222222222222")
    assert tx["_fn_name"] == "registerNode"
    assert tx["_args"] == ('{"gpu":false}',)


def test_build_deposit_stake_tx_payable_sets_value(monkeypatch: pytest.MonkeyPatch) -> None:
    abi = [{"type": "function", "name": "depositStake", "inputs": []}]
    monkeypatch.setattr(JobManagerClient, "_load_abi", staticmethod(lambda: abi))

    web3 = _FakeWeb3()
    client = JobManagerClient(web3=web3, address="0x1111111111111111111111111111111111111111")

    tx = client.build_deposit_stake_tx(
        from_address="0x2222222222222222222222222222222222222222",
        amount_wei=12345,
    )

    assert tx["from"] == Web3.to_checksum_address("0x2222222222222222222222222222222222222222")
    assert tx["value"] == 12345
    assert tx["_args"] == ()


def test_build_deposit_stake_tx_amount_arg(monkeypatch: pytest.MonkeyPatch) -> None:
    abi = [{"type": "function", "name": "depositStake", "inputs": [{"name": "amount", "type": "uint256"}]}]
    monkeypatch.setattr(JobManagerClient, "_load_abi", staticmethod(lambda: abi))

    web3 = _FakeWeb3()
    client = JobManagerClient(web3=web3, address="0x1111111111111111111111111111111111111111")

    tx = client.build_deposit_stake_tx(
        from_address="0x2222222222222222222222222222222222222222",
        amount_wei=777,
    )

    assert tx["from"] == Web3.to_checksum_address("0x2222222222222222222222222222222222222222")
    assert tx["value"] == 0
    assert tx["_args"] == (777,)
