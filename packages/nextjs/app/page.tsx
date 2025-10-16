"use client";

import type { NextPage } from "next";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const Home: NextPage = () => {
  const { address: connectedAddress, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  // Read vault name and symbol
  const {
    data: vaultName,
    isLoading: nameLoading,
    error: nameError,
  } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "name",
  });

  const { data: vaultSymbol } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "symbol",
  });

  // Read total vault stats
  const { data: totalAssets } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalAssets",
  });

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalSupply",
  });

  const { data: vaultDecimals } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "decimals",
  });

  // Check if we're on the correct network
  const isWrongNetwork = chain && chain.id !== targetNetwork.id;

  // Read user-specific data
  const { data: userBalance } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: userAssets } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "convertToAssets",
    args: [userBalance],
  });

  // Format numbers for display
  const formatAmount = (value: bigint | undefined, decimalsValue: number | undefined) => {
    if (value === undefined || decimalsValue === undefined) return "...";
    return parseFloat(formatUnits(value, decimalsValue)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  // Determine asset decimals (likely 6 for USDC/USDT based on the raw values)
  // We can infer this from the magnitude of totalAssets vs totalSupply
  const inferredAssetDecimals = 6; // Most vault assets are USDC with 6 decimals

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-7xl">
          {/* Network Warning */}
          {isWrongNetwork && (
            <div className="alert alert-warning mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Wrong network! Please switch to <strong>{targetNetwork.name}</strong> to view vault data.
              </span>
            </div>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">{vaultName || "Loading..."}</h1>
            <p className="text-xl text-base-content/70">{vaultSymbol || ""}</p>
            {nameLoading && <p className="text-sm text-base-content/50">Loading vault info...</p>}
            {nameError && <p className="text-sm text-error">Error loading vault: {nameError.message}</p>}
          </div>

          {/* Connected Address */}
          <div className="flex justify-center items-center space-x-2 flex-col mb-12">
            <p className="font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
            {chain && (
              <p className="text-sm text-base-content/60">
                Network: {chain.name} (ID: {chain.id})
              </p>
            )}
          </div>

          {/* Vault Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Total Assets Card */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-base-content/60 mb-2">Total Assets</h3>
              <p className="text-3xl font-bold">{formatAmount(totalAssets, inferredAssetDecimals)}</p>
              <p className="text-xs text-base-content/50 mt-1">USDC</p>
            </div>

            {/* Total Supply Card */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-base-content/60 mb-2">Total Supply (Shares)</h3>
              <p className="text-3xl font-bold">{formatAmount(totalSupply, vaultDecimals)}</p>
            </div>

            {/* User Balance Card */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-lg">
              <h3 className="text-sm font-medium text-base-content/60 mb-2">Your Balance (Shares)</h3>
              <p className="text-3xl font-bold">
                {connectedAddress ? formatAmount(userBalance, vaultDecimals) : "Connect Wallet"}
              </p>
            </div>

            {/* User Assets Value Card */}
            <div className="bg-base-100 rounded-3xl p-6 shadow-lg md:col-span-2 lg:col-span-3">
              <h3 className="text-sm font-medium text-base-content/60 mb-2">Your Assets Value</h3>
              <p className="text-3xl font-bold">
                {connectedAddress ? formatAmount(userAssets, inferredAssetDecimals) : "Connect Wallet"}
              </p>
              <p className="text-xs text-base-content/50 mt-1">USDC</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
