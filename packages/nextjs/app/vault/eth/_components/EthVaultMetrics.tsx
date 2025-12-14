import { EthVaultData } from "~~/hooks/sovabase/useEthVaultData";
import { DEFAULT_ETH_DECIMALS, formatEthAmount } from "~~/utils/sovabase";

interface EthVaultMetricsProps {
  data: EthVaultData;
}

export const EthVaultMetrics = ({ data }: EthVaultMetricsProps) => {
  const { totalAssets } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-base-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-medium text-base-content/60 mb-1">Total Deposits (TVL)</h3>
        <p className="text-2xl font-bold">{formatEthAmount(totalAssets, DEFAULT_ETH_DECIMALS)} ETH</p>
        <p className="text-xs text-base-content/50 mt-0.5">Total value locked in vault</p>
      </div>

      <div className="bg-base-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-xs font-medium text-base-content/60 mb-1">Available Liquidity</h3>
        <p className="text-2xl font-bold">{formatEthAmount(totalAssets, DEFAULT_ETH_DECIMALS)} ETH</p>
        <p className="text-xs text-base-content/50 mt-0.5">Available for withdrawal</p>
      </div>
    </div>
  );
};
