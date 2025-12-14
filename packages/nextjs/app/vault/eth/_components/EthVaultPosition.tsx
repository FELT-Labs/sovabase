import { EthVaultData } from "~~/hooks/sovabase/useEthVaultData";
import { DEFAULT_ETH_DECIMALS, formatEthAmount } from "~~/utils/sovabase";

interface EthVaultPositionProps {
  connectedAddress?: string;
  data: EthVaultData;
}

export const EthVaultPosition = ({ connectedAddress, data }: EthVaultPositionProps) => {
  const { userBalance, userAssets, vaultDecimals, sharePrice } = data;

  if (!connectedAddress) {
    return (
      <div className="bg-base-100 rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-4">Your Position</h3>
        <p className="text-base-content/60 text-sm">Connect your wallet to view your position</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-4">Your Position</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-base-content/60">Vault Shares</span>
          <span className="font-medium">{formatEthAmount(userBalance, vaultDecimals || 18)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-base-content/60">Underlying Value</span>
          <span className="font-medium">{formatEthAmount(userAssets, DEFAULT_ETH_DECIMALS)} WETH</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-base-content/60">Share Price</span>
          <span className="font-medium">{sharePrice.toFixed(4)} WETH</span>
        </div>
      </div>
    </div>
  );
};
