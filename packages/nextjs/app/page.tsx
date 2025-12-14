"use client";

import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { VaultCard } from "~~/components/sovabase/VaultCard";
import { useEthVaultData } from "~~/hooks/sovabase/useEthVaultData";
import { useUsdcVaultData } from "~~/hooks/sovabase/useUsdcVaultData";
import { DEFAULT_ETH_DECIMALS, DEFAULT_USDC_DECIMALS } from "~~/utils/sovabase";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { vaultSymbol, totalAssets, userAssets } = useUsdcVaultData();
  const { vaultSymbol: ethVaultSymbol, totalAssets: ethTotalAssets, userAssets: ethUserAssets } = useEthVaultData();

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
            <VaultCard
              name="USDC Vault"
              symbol={vaultSymbol || ""}
              totalAssets={totalAssets}
              userAssets={connectedAddress ? userAssets : undefined}
              decimals={DEFAULT_USDC_DECIMALS}
              assetDecimals={DEFAULT_USDC_DECIMALS}
              href="/vault/usdc"
              icon="💵"
              assetName="USDC"
            />

            {/* ETH Vault Card */}
            <VaultCard
              name="ETH Vault"
              symbol={ethVaultSymbol || ""}
              totalAssets={ethTotalAssets}
              userAssets={connectedAddress ? ethUserAssets : undefined}
              decimals={DEFAULT_ETH_DECIMALS}
              assetDecimals={DEFAULT_ETH_DECIMALS}
              href="/vault/eth"
              icon="💎"
              assetName="WETH"
              displayDecimals={4}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
