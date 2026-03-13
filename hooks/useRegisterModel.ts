"use client";
import { useWriteContract } from 'wagmi';
import ModelRegistryABI from '@/lib/abis/ModelRegistryABI.json';

const CONTRACT_ADDRESS = "0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91";

export function useRegisterModel() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();

  const register = async (creatorAddress: string, ipfsCID: string) => {
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: ModelRegistryABI,
        functionName: 'registerModel',
        args: [creatorAddress, ipfsCID],
      });
    } catch (err) {
      console.error("Contract Call Failed:", err);
      throw err;
    }
  };

  return { register, isPending, hash };
}
