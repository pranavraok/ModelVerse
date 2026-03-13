const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Staking = await ethers.getContractFactory("NodeStaking");
  const staking = await Staking.deploy(deployer.address);
  await staking.waitForDeployment();

  const address = await staking.getAddress();
  console.log("NodeStaking deployed:", address);

  // Persist for integration convenience.
  console.log("export NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
