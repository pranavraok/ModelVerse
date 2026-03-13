import { ethers } from "https://esm.sh/ethers@6.13.2";

const STAKING_ABI = [
  {
    type: "function",
    name: "isNodeActive",
    stateMutability: "view",
    inputs: [{ name: "node", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export async function isNodeActiveOnchain(walletAddress: string): Promise<boolean> {
  const rpcUrl = Deno.env.get("AMOY_RPC_URL") || "https://rpc-amoy.polygon.technology";
  const stakingAddress = Deno.env.get("STAKING_CONTRACT_ADDRESS") || "";

  if (!stakingAddress) {
    throw new Error("Missing STAKING_CONTRACT_ADDRESS secret");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const contract = new ethers.Contract(stakingAddress, STAKING_ABI, provider);
  const active = await contract.isNodeActive(walletAddress);
  return Boolean(active);
}
