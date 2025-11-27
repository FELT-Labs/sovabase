import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import useMorphoVault from "~~/hooks/morpho/useMorphoVault";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DEFAULT_ASSET_DECIMALS } from "~~/utils/sovabase";

export interface VaultData {
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

export const useVaultData = (vaultContractName: "vault" = "vault", usdcContractName: "usdc" = "usdc"): VaultData => {
  const { address: connectedAddress } = useAccount();

  // Vault metadata
  const { data: vaultName } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "name",
  });

  const { data: vaultSymbol } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "symbol",
  });

  const { data: vaultAsset } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "asset",
  });

  const { data: vaultDecimals } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "decimals",
  });

  const { data: vaultFee } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "fee",
  });

  const { data: feeRecipient } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "feeRecipient",
  });

  // Vault Stats
  const { data: totalAssets, refetch: refetchTotalAssets } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "totalAssets",
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "totalSupply",
  });

  // User Data
  const { data: userBalance, refetch: refetchUserBalance } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: userAssets, refetch: refetchUserAssets } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "convertToAssets",
    args: [userBalance],
  });

  const { data: maxDeposit } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "maxDeposit",
    args: [connectedAddress],
  });

  const { data: maxWithdraw } = useScaffoldReadContract({
    contractName: vaultContractName,
    functionName: "maxWithdraw",
    args: [connectedAddress],
  });

  // USDC Data
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useScaffoldReadContract({
    contractName: usdcContractName,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Morpho APY
  const { data: vaultContractInfo } = useDeployedContractInfo(vaultContractName);
  const { data: morphoData } = useMorphoVault(vaultContractInfo?.address);

  // Derived Data
  const sharePrice =
    totalAssets && totalSupply && totalSupply > 0n
      ? parseFloat(formatUnits(totalAssets, DEFAULT_ASSET_DECIMALS)) /
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
