"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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
      maximumFractionDigits: 2,
    });
  };

  // Determine asset decimals (likely 6 for USDC/USDT based on the raw values)
  // We can infer this from the magnitude of totalAssets vs totalSupply
  const inferredAssetDecimals = 6; // Most vault assets are USDC with 6 decimals

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🦉</div>
            <h1 className="text-4xl font-bold mb-3">The Wise Way to Manage Your Crypto</h1>
            <p className="text-lg text-base-content/70 mb-6">
              Stop chasing DeFi yields. Let the owl watch while you build.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-base-content/60 mb-8">
              <span className="flex items-center gap-1">🔒 Non-custodial</span>
              <span className="flex items-center gap-1">✓ Smart Contracts</span>
              <span className="flex items-center gap-1">🔑 Your Keys, Always</span>
            </div>
          </div>

          {/* Vaults Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">SovaBase Vaults</h2>
            <p className="text-sm text-base-content/70">Steady returns from battle-tested DeFi protocols</p>
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
