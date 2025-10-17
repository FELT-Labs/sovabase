"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const VaultDetailPage: NextPage = () => {
  // const params = useParams();
  // const vaultName = params?.vaultName as string;
  const { address: connectedAddress } = useAccount();

  // Read vault name and symbol
  const {
    data: contractVaultName,
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
  const inferredAssetDecimals = 6;

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-7xl">
          {/* Back Button */}
          <Link href="/" className="btn btn-ghost mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Vaults
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl mr-4">💵</div>
              <div>
                <h1 className="text-5xl font-bold mb-2">{contractVaultName || "Loading..."}</h1>
                <p className="text-2xl text-base-content/70">{vaultSymbol || ""}</p>
              </div>
            </div>
            {nameLoading && <p className="text-sm text-base-content/50">Loading vault info...</p>}
            {nameError && <p className="text-sm text-error">Error loading vault: {nameError.message}</p>}
          </div>

          {/* Vault Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

          {/* Actions Section - Placeholder for future functionality */}
          <div className="bg-base-100 rounded-3xl p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">Vault Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="btn btn-primary btn-lg" disabled>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Deposit (Coming Soon)
              </button>
              <button className="btn btn-secondary btn-lg" disabled>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Withdraw (Coming Soon)
              </button>
            </div>
            <p className="text-sm text-base-content/60 mt-4 text-center">
              Deposit and withdrawal functionality will be available soon.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultDetailPage;
