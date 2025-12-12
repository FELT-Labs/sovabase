import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import useMorphoVault from "~~/hooks/morpho/useMorphoVault";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DEFAULT_USDC_DECIMALS } from "~~/utils/sovabase";

export interface UsdcVaultData {
  vaultAddress?: string;
  vaultName?: string;
  vaultSymbol?: string;
  vaultAsset?: string;
  totalAssets?: bigint;
  totalSupply?: bigint;
  vaultDecimals?: number;
  vaultFee?: bigint;
  feeRecipient?: string;
  userBalance?: bigint;
  userAssets?: bigint;
  maxDeposit?: bigint;
  maxWithdraw?: bigint;
  usdcBalance?: bigint;
  apy?: number;
  sharePrice: number;
  feePercentage: number;
  refetch: () => Promise<void>;
}

export const useUsdcVaultData = (): UsdcVaultData => {
  const { address: connectedAddress } = useAccount();

  // Vault metadata
  const { data: vaultName } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "name",
  });

  const { data: vaultSymbol } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "symbol",
  });

  const { data: vaultAsset } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "asset",
  });

  const { data: vaultDecimals } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "decimals",
  });

  const { data: vaultFee } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "fee",
  });

  const { data: feeRecipient } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "feeRecipient",
  });

  // Vault Stats
  const { data: totalAssets, refetch: refetchTotalAssets } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalAssets",
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalSupply",
  });

  // User Data
  const { data: userBalance, refetch: refetchUserBalance } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: userAssets, refetch: refetchUserAssets } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "convertToAssets",
    args: [userBalance],
  });

  const { data: maxDeposit } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "maxDeposit",
    args: [connectedAddress],
  });

  const { data: maxWithdraw } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "maxWithdraw",
    args: [connectedAddress],
  });

  // USDC Data
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Morpho APY
  const { data: vaultContractInfo } = useDeployedContractInfo("vault");
  const { data: morphoData } = useMorphoVault(vaultContractInfo?.address);

  // Derived Data
  const sharePrice =
    totalAssets && totalSupply && totalSupply > 0n
      ? parseFloat(formatUnits(totalAssets, DEFAULT_USDC_DECIMALS)) /
        parseFloat(formatUnits(totalSupply, vaultDecimals || 18))
      : 1;

  const feePercentage = vaultFee ? (Number(vaultFee) / 1e18) * 100 : 0;

  const refetch = async () => {
    await Promise.all([
      refetchTotalAssets(),
      refetchTotalSupply(),
      refetchUserBalance(),
      refetchUserAssets(),
      refetchUsdcBalance(),
    ]);
  };

  return {
    vaultAddress: vaultContractInfo?.address,
    vaultName,
    vaultSymbol,
    vaultAsset,
    totalAssets,
    totalSupply,
    vaultDecimals,
    vaultFee,
    feeRecipient,
    userBalance,
    userAssets,
    maxDeposit,
    maxWithdraw,
    usdcBalance,
    apy: morphoData?.apy,
    sharePrice,
    feePercentage,
    refetch,
  };
};
