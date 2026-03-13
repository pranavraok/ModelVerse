const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("NodeStaking", function () {
  async function deployFixture() {
    const [owner, node, other] = await ethers.getSigners();
    const Staking = await ethers.getContractFactory("NodeStaking");
    const staking = await Staking.deploy(owner.address);
    await staking.waitForDeployment();
    return { staking, owner, node, other };
  }

  it("stakes exactly 1 MATIC", async function () {
    const { staking, node } = await deployFixture();
    await expect(staking.connect(node).stake({ value: ethers.parseEther("1") }))
      .to.emit(staking, "NodeStaked")
      .withArgs(node.address, anyValue);
    expect(await staking.totalStaked()).to.equal(ethers.parseEther("1"));
    expect(await staking.isNodeActive(node.address)).to.equal(true);
  });

  it("rejects wrong stake amount", async function () {
    const { staking, node } = await deployFixture();
    await expect(
      staking.connect(node).stake({ value: ethers.parseEther("0.5") })
    ).to.be.revertedWith("Must stake exactly 1 MATIC");
  });

  it("allows manual unstake refund", async function () {
    const { staking, node } = await deployFixture();
    await staking.connect(node).stake({ value: ethers.parseEther("1") });
    await expect(staking.connect(node).unstake()).to.emit(staking, "NodeUnstaked");
    expect(await staking.isNodeActive(node.address)).to.equal(false);
    expect(await staking.totalStaked()).to.equal(0n);
  });

  it("owner can slash active node", async function () {
    const { staking, node, owner } = await deployFixture();
    await staking.connect(node).stake({ value: ethers.parseEther("1") });
    await expect(staking.connect(owner).slashNode(node.address))
      .to.emit(staking, "NodeSlashed");
    expect(await staking.isNodeActive(node.address)).to.equal(false);
    expect(await staking.isSlashed(node.address)).to.equal(true);
  });
});
