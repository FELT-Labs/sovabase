import { UsdcVaultData } from "~~/hooks/sovabase/useUsdcVaultData";
import { DEFAULT_USDC_DECIMALS, formatAmount } from "~~/utils/sovabase";

interface VaultMetricsProps {
  data: UsdcVaultData;
}

export const VaultMetrics = ({ data }: VaultMetricsProps) => {
  const { totalAssets, apy } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-base-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-medium text-base-content/60 mb-1">Total Deposits</h3>
        <p className="text-2xl font-bold">${formatAmount(totalAssets, DEFAULT_USDC_DECIMALS)}</p>
        <p className="text-xs text-base-content/50 mt-0.5">{formatAmount(totalAssets, DEFAULT_USDC_DECIMALS)} USDC</p>
      </div>

      <div className="bg-base-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-medium text-base-content/60 mb-1">Liquidity</h3>
        <p className="text-2xl font-bold">${formatAmount(totalAssets, DEFAULT_USDC_DECIMALS)}</p>
        <p className="text-xs text-base-content/50 mt-0.5">{formatAmount(totalAssets, DEFAULT_USDC_DECIMALS)} USDC</p>
      </div>

      <div className="bg-base-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-medium text-base-content/60 mb-1">APY</h3>
        <p className="text-2xl font-bold">{apy !== undefined ? `${(apy * 100).toFixed(2)}%` : "..."}</p>
        <p className="text-xs text-base-content/50 mt-0.5">Current rate</p>
      </div>
    </div>
  );
};
