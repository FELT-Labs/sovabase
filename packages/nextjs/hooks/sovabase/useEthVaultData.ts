import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { DEFAULT_ETH_DECIMALS } from "~~/utils/sovabase";

export interface EthVaultData {
  vaultAddress?: string;
  vaultName?: string;
  vaultSymbol?: string;
  vaultAsset?: string;
  totalAssets?: bigint;
  totalSupply?: bigint;
  vaultDecimals?: number;
  performanceFee?: bigint;
  managementFee?: bigint;
  userBalance?: bigint;
  userAssets?: bigint;
  maxDeposit?: bigint;
  maxWithdraw?: bigint;
  wethBalance?: bigint;
  sharePrice: number;
  refetch: () => Promise<void>;
}

export const useEthVaultData = (): EthVaultData => {
  const { address: connectedAddress } = useAccount();

  // Vault metadata
  const { data: vaultName } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "name",
  });

  const { data: vaultSymbol } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "symbol",
  });

  const { data: vaultAsset } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "asset",
  });

  const { data: vaultDecimals } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "decimals",
  });

  const { data: performanceFee } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "performanceFee",
  });

  const { data: managementFee } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "managementFee",
  });

  // Vault Stats
  const { data: totalAssets, refetch: refetchTotalAssets } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "totalAssets",
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "totalSupply",
  });

  // User Data
  const { data: userBalance, refetch: refetchUserBalance } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: userAssets, refetch: refetchUserAssets } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "convertToAssets",
    args: [userBalance],
  });

  const { data: maxDeposit, refetch: refetchMaxDeposit } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "maxDeposit",
    args: [connectedAddress],
  });

  const { data: maxWithdraw, refetch: refetchMaxWithdraw } = useScaffoldReadContract({
    contractName: "ethVault",
    functionName: "maxWithdraw",
    args: [connectedAddress],
  });

  // WETH Data
  const { data: wethBalance, refetch: refetchWethBalance } = useScaffoldReadContract({
    contractName: "weth",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Contract Info
  const { data: vaultContractInfo } = useDeployedContractInfo("ethVault");

  // Derived Data
  const sharePrice =
    totalAssets && totalSupply && totalSupply > 0n
      ? parseFloat(formatUnits(totalAssets, DEFAULT_ETH_DECIMALS)) /
        parseFloat(formatUnits(totalSupply, vaultDecimals || 18))
      : 1;

  const refetch = async () => {
    await Promise.all([
      refetchTotalAssets(),
      refetchTotalSupply(),
      refetchUserBalance(),
      refetchUserAssets(),
      refetchWethBalance(),
      refetchMaxDeposit(),
      refetchMaxWithdraw(),
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
    performanceFee,
    managementFee,
    userBalance,
    userAssets,
    maxDeposit,
    maxWithdraw,
    wethBalance,
    sharePrice,
    refetch,
  };
};
