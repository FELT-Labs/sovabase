import { Address } from "~~/components/scaffold-eth";
import { VaultData } from "~~/hooks/sovabase/useVaultData";
import { DEFAULT_ASSET_DECIMALS, formatAmount } from "~~/utils/sovabase";

interface VaultDataTabsProps {
  activeTab: "position" | "overview" | "details";
  setActiveTab: (tab: "position" | "overview" | "details") => void;
  connectedAddress?: string;
  data: VaultData;
}

export const VaultDataTabs = ({ activeTab, setActiveTab, connectedAddress, data }: VaultDataTabsProps) => {
  const {
    userAssets,
    userBalance,
    usdcBalance,
    maxDeposit,
    maxWithdraw,
    sharePrice,
    totalAssets,
    totalSupply,
    vaultDecimals,
    vaultName,
    vaultSymbol,
    feePercentage,
    feeRecipient,
    vaultAsset,
    apy,
  } = data;

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
      <div className="bg-base-100 rounded-xl p-4 shadow-sm min-h-[400px]">
        {/* Your Position Tab */}
        {activeTab === "position" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-base-content/60 mb-2">My Deposit (USDC)</h3>
              <p className="text-3xl font-bold">
                {connectedAddress ? formatAmount(userAssets, DEFAULT_ASSET_DECIMALS) : "0.00"}
              </p>
              <p className="text-xs text-base-content/50 mt-1">
                {connectedAddress ? formatAmount(userBalance, vaultDecimals) : "0.00"} shares
              </p>
            </div>

            <div className="divider my-2"></div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">USDC Balance</h4>
                <p className="text-lg font-semibold">
                  {connectedAddress ? formatAmount(usdcBalance, DEFAULT_ASSET_DECIMALS) : "0.00"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Max Deposit</h4>
                <p className="text-lg font-semibold">
                  {connectedAddress ? formatAmount(maxDeposit, DEFAULT_ASSET_DECIMALS) : "0.00"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Max Withdraw</h4>
                <p className="text-lg font-semibold">
                  {connectedAddress ? formatAmount(maxWithdraw, DEFAULT_ASSET_DECIMALS) : "0.00"}
                </p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Share Price</h4>
                <p className="text-lg font-semibold">{sharePrice.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Total Assets</h4>
                <p className="text-xl font-semibold">{formatAmount(totalAssets, DEFAULT_ASSET_DECIMALS)}</p>
                <p className="text-xs text-base-content/50">USDC</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Total Supply</h4>
                <p className="text-xl font-semibold">{formatAmount(totalSupply, vaultDecimals)}</p>
                <p className="text-xs text-base-content/50">Shares</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Share Price</h4>
                <p className="text-xl font-semibold">{sharePrice.toFixed(2)}</p>
                <p className="text-xs text-base-content/50">USDC per share</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">APY</h4>
                <p className="text-xl font-semibold">{apy ? (apy * 100).toFixed(2) : "0.00"}%</p>
                <p className="text-xs text-base-content/50">Current</p>
              </div>
            </div>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Vault Name</h4>
                <p className="text-sm font-medium">{vaultName || "..."}</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Symbol</h4>
                <p className="text-sm font-medium">{vaultSymbol || "..."}</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Fee</h4>
                <p className="text-sm font-medium">{feePercentage.toFixed(2)}%</p>
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Fee Recipient</h4>
                {feeRecipient ? <Address address={feeRecipient} /> : <p className="text-sm">...</p>}
              </div>
              <div>
                <h4 className="text-xs text-base-content/60 mb-1">Asset Address</h4>
                {vaultAsset ? <Address address={vaultAsset} /> : <p className="text-sm">...</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
