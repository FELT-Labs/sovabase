"use client";

import { PositionHistoryChart } from "./PositionHistoryChart";
import { VaultHistoryChart } from "./VaultHistoryChart";
import { formatUnits } from "viem";
import { Address } from "~~/components/scaffold-eth";
import { useMorphoUserPosition } from "~~/hooks/morpho/useMorphoUserPosition";
import { UsdcVaultData } from "~~/hooks/sovabase/useUsdcVaultData";
import { DEFAULT_USDC_DECIMALS, formatAmount } from "~~/utils/sovabase";

export type VaultTab = "position" | "overview" | "details";

interface VaultDataTabsProps {
  activeTab: VaultTab;
  setActiveTab: (tab: VaultTab) => void;
  connectedAddress?: string;
  data: UsdcVaultData;
}

export const VaultDataTabs = ({ activeTab, setActiveTab, connectedAddress, data }: VaultDataTabsProps) => {
  const {
    vaultAddress,
    userAssets,
    userBalance,
    usdcBalance,
    maxDeposit,
    maxWithdraw,
    sharePrice,
    vaultDecimals,
    vaultName,
    vaultSymbol,
    feePercentage,
    feeRecipient,
    vaultAsset,
    totalSupply,
    apy,
  } = data;

  // Fetch user position data for PnL
  const { data: positionData } = useMorphoUserPosition(vaultAddress, connectedAddress);

  // Calculate ownership percentage
  const ownershipPercentage =
    userBalance && totalSupply && totalSupply > 0n
      ? (Number(formatUnits(userBalance, vaultDecimals || 18)) /
          Number(formatUnits(totalSupply, vaultDecimals || 18))) *
        100
      : 0;

  // Calculate estimated earnings
  const userAssetsNumber = userAssets ? Number(formatUnits(userAssets, DEFAULT_USDC_DECIMALS)) : 0;
  const dailyEarnings = apy ? (userAssetsNumber * apy) / 365 : 0;
  const monthlyEarnings = dailyEarnings * 30;
  const yearlyEarnings = apy ? userAssetsNumber * apy : 0;

  // PnL data
  const pnl = positionData?.pnl || 0;
  const roe = positionData?.roe || 0;
  const isProfitable = pnl >= 0;

  return (
    <div className="lg:col-span-2">
      {/* Tabs */}
      <div className="tabs tabs-boxed bg-base-100 mb-4 p-1">
        <button
          className={`tab tab-sm ${activeTab === "position" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("position")}
        >
          Your Position
        </button>
        <button
          className={`tab tab-sm ${activeTab === "overview" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`tab tab-sm ${activeTab === "details" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
      </div>

      {/* Tab Content */}
      {/* Your Position Tab */}
      {activeTab === "position" && (
        <div className="space-y-4">
          {/* Holdings Card */}
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-medium text-base-content/60 uppercase tracking-wide mb-3">Your Holdings</h3>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-3xl font-bold">
                  {connectedAddress ? formatAmount(userAssets, DEFAULT_USDC_DECIMALS) : "0.00"}
                  <span className="text-lg text-base-content/60 ml-1">USDC</span>
                </p>
                <p className="text-sm text-base-content/50 mt-1">
                  {connectedAddress ? formatAmount(userBalance, vaultDecimals) : "0.00"} shares
                </p>
              </div>
              {connectedAddress && ownershipPercentage > 0 && (
                <div className="text-right">
                  <p className="text-xs text-base-content/50">Vault Ownership</p>
                  <p className="text-lg font-semibold text-accent">{ownershipPercentage.toFixed(4)}%</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-medium text-base-content/60 uppercase tracking-wide mb-3">Performance</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-base-content/50 mb-1">Profit / Loss</p>
                <p className={`text-xl font-bold ${isProfitable ? "text-emerald-500" : "text-error"}`}>
                  {isProfitable ? "+" : ""}
                  {pnl.toFixed(2)} USDC
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/50 mb-1">Return (ROE)</p>
                <p className={`text-xl font-bold ${isProfitable ? "text-emerald-500" : "text-error"}`}>
                  {isProfitable ? "+" : ""}
                  {roe.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Estimated Earnings */}
            {connectedAddress && userAssetsNumber > 0 && (
              <div className="border-t border-base-300 pt-3">
                <p className="text-xs text-base-content/50 mb-2">
                  Estimated Earnings (at {((apy || 0) * 100).toFixed(2)}% APY)
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-base-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-base-content/50">Daily</p>
                    <p className="text-sm font-semibold text-emerald-500">+{dailyEarnings.toFixed(4)}</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-base-content/50">Monthly</p>
                    <p className="text-sm font-semibold text-emerald-500">+{monthlyEarnings.toFixed(2)}</p>
                  </div>
                  <div className="bg-base-200 rounded-lg p-2 text-center">
                    <p className="text-xs text-base-content/50">Yearly</p>
                    <p className="text-sm font-semibold text-emerald-500">+{yearlyEarnings.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Position History Chart */}
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <PositionHistoryChart
              vaultAddress={vaultAddress}
              userAddress={connectedAddress}
              currentValue={userAssetsNumber}
            />
          </div>

          {/* Limits Card */}
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-medium text-base-content/60 uppercase tracking-wide mb-3">Limits & Balance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-base-content/50 mb-1">USDC Balance</p>
                <p className="text-lg font-semibold">
                  {connectedAddress ? formatAmount(usdcBalance, DEFAULT_USDC_DECIMALS) : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/50 mb-1">Max Deposit</p>
                <p className="text-lg font-semibold">
                  {connectedAddress ? formatAmount(maxDeposit, DEFAULT_USDC_DECIMALS) : "0.00"}
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/50 mb-1">Max Withdraw</p>
                <p className="text-lg font-semibold">
                  {connectedAddress ? formatAmount(maxWithdraw, DEFAULT_USDC_DECIMALS) : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overview Tab - APY and Deposits Charts as separate cards */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <VaultHistoryChart vaultAddress={vaultAddress} chartType="apy" />
          </div>
          <div className="bg-base-100 rounded-xl p-4 shadow-sm">
            <VaultHistoryChart vaultAddress={vaultAddress} chartType="deposits" />
          </div>
        </div>
      )}

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="bg-base-100 rounded-xl p-4 shadow-sm">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Vault Name</h4>
                <p className="text-sm font-medium">{vaultName || "..."}</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Symbol</h4>
                <p className="text-sm font-medium">{vaultSymbol || "..."}</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Share Price</h4>
                <p className="text-sm font-medium">{sharePrice.toFixed(6)} USDC</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Performance Fee</h4>
                <p className="text-sm font-medium">{feePercentage.toFixed(2)}%</p>
              </div>
            </div>
            <div className="divider my-2"></div>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Fee Recipient</h4>
                {feeRecipient ? <Address address={feeRecipient} /> : <p className="text-sm">...</p>}
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Asset Address</h4>
                {vaultAsset ? <Address address={vaultAsset} /> : <p className="text-sm">...</p>}
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Vault Address</h4>
                {vaultAddress ? <Address address={vaultAddress} /> : <p className="text-sm">...</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
