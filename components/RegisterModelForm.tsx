"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useRegisterModel } from "@/hooks/useRegisterModel";

export function RegisterModelForm() {
  const [ipfsCID, setIpfsCID] = useState("");
  const { address, isConnected } = useAccount();
  const { register, isPending, hash } = useRegisterModel();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!ipfsCID) {
      alert("Please enter an IPFS CID.");
      return;
    }
    try {
      await register(address, ipfsCID);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg p-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Register New Model</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="ipfsCID" className="block text-sm font-medium text-gray-300 mb-1">
            IPFS CID
          </label>
          <input
            id="ipfsCID"
            type="text"
            value={ipfsCID}
            onChange={(e) => setIpfsCID(e.target.value)}
            placeholder="Qm..."
            className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Registering..." : "Register Model"}
        </button>
      </form>
      {hash && (
        <div className="mt-4 p-3 bg-gray-800 rounded-md border border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Transaction Hash:</p>
          <a
            href={`https://polygonscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm hover:underline break-all"
          >
            {hash}
          </a>
        </div>
      )}
    </div>
  );
}