"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const Home: NextPage = () => {
  const { address: connectedAddress, chain } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: vaultSymbol } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "symbol",
  });

  // Read total vault stats
  const { data: totalAssets } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalAssets",
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
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-1">Sovabase Vaults</h1>
            <p className="text-sm text-base-content/70">Secure and efficient yield vaults</p>
          </div>

          {/* Connected Address */}
          <div className="flex justify-center items-center space-x-2 flex-col mb-6">
            <p className="font-medium text-xs">Connected Address:</p>
            <Address address={connectedAddress} />
            {chain && (
              <p className="text-xs text-base-content/60">
                Network: {chain.name} (ID: {chain.id})
              </p>
            )}
          </div>

          {/* Vault Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* USDC Vault Card */}
            <Link href="/vault/usdc" className="group">
              <div className="bg-base-100 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-primary">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold">USDC Vault</h2>
                    <p className="text-xs text-base-content/70">{vaultSymbol || ""}</p>
                  </div>
                  <div className="text-3xl">💵</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-base-200 rounded-lg p-2">
                    <p className="text-xs text-base-content/60">Total Assets</p>
                    <p className="text-lg font-bold">{formatAmount(totalAssets, inferredAssetDecimals)}</p>
                    <p className="text-xs text-base-content/50">USDC</p>
                  </div>

                  <div className="bg-base-200 rounded-lg p-2">
                    <p className="text-xs text-base-content/60">Your Balance</p>
                    <p className="text-lg font-bold">
                      {connectedAddress ? formatAmount(userBalance, vaultDecimals) : "0.00"}
                    </p>
                    <p className="text-xs text-base-content/50">Shares</p>
                  </div>
                </div>
              </div>
            </Link>

            {/* ETH Vault Card (Under Development) */}
            <div className="relative group cursor-not-allowed">
              <div className="bg-base-100 rounded-xl p-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 border-2 border-base-300 opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold">ETH Vault</h2>
                    <p className="text-xs text-base-content/70">svETH</p>
                  </div>
                  <div className="text-3xl">💎</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-base-200 rounded-lg p-2">
                    <p className="text-xs text-base-content/60">Total Assets</p>
                    <p className="text-lg font-bold">--</p>
                    <p className="text-xs text-base-content/50">ETH</p>
                  </div>

                  <div className="bg-base-200 rounded-lg p-2">
                    <p className="text-xs text-base-content/60">Your Balance</p>
                    <p className="text-lg font-bold">--</p>
                    <p className="text-xs text-base-content/50">Shares</p>
                  </div>
                </div>
              </div>

              {/* Under Development Badge */}
              <div className="absolute top-2 right-2 bg-warning text-warning-content px-2 py-1 rounded-full font-semibold text-xs shadow-lg">
                🚧 Coming Soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
