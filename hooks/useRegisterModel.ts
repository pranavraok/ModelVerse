"use client";

import { useWriteContract } from 'wagmi';
import { ModelRegistryABI } from '../lib/abis/ModelRegistryABI'; // Ensure path is right

export function useRegisterModel() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const register = (creatorAddress: `0x${string}`, ipfsCID: string) => {
    writeContract({
      address: '0x818e9Df23c8A2B61b7796b0A081C0bA1014d1d91', // Your deployed address
      abi: ModelRegistryABI,
      functionName: 'registerModel',
      args: [creatorAddress, ipfsCID],
    });
  };

  return { register, hash, isPending, error };
}
