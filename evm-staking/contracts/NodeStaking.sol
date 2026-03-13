// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NodeStaking is ReentrancyGuard, Ownable {
    uint256 public constant STAKE_AMOUNT = 1 ether; // 1 MATIC on Polygon Amoy

    mapping(address => bool) private _active;
    mapping(address => bool) public isSlashed;

    uint256 public totalStaked;

    event NodeStaked(address indexed node, uint256 timestamp);
    event NodeUnstaked(address indexed node, uint256 timestamp);
    event NodeSlashed(address indexed node, address indexed admin, uint256 timestamp);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function stake() external payable nonReentrant {
        require(msg.value == STAKE_AMOUNT, "Must stake exactly 1 MATIC");
        require(!_active[msg.sender], "Already staked");
        require(!isSlashed[msg.sender], "Node slashed");

        _active[msg.sender] = true;
        totalStaked += STAKE_AMOUNT;

        emit NodeStaked(msg.sender, block.timestamp);
    }

    function isNodeActive(address node) external view returns (bool) {
        return _active[node] && !isSlashed[node];
    }

    function slashNode(address node) external onlyOwner nonReentrant {
        require(_active[node], "Not active");

        _active[node] = false;
        isSlashed[node] = true;
        totalStaked -= STAKE_AMOUNT;

        (bool sent, ) = payable(owner()).call{value: STAKE_AMOUNT}("");
        require(sent, "Protocol transfer failed");

        emit NodeSlashed(node, msg.sender, block.timestamp);
    }

    function unstake() external nonReentrant {
        require(_active[msg.sender] && !isSlashed[msg.sender], "Not active node");

        _active[msg.sender] = false;
        totalStaked -= STAKE_AMOUNT;

        (bool sent, ) = payable(msg.sender).call{value: STAKE_AMOUNT}("");
        require(sent, "Refund failed");

        emit NodeUnstaked(msg.sender, block.timestamp);
    }
}
