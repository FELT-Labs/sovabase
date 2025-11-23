"use client";

import { useState } from "react";
import { VaultActions, VaultDataTabs, VaultHeader, VaultMetrics } from "../_components";
import type { NextPage } from "next";
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import useMorphoVault from "~~/hooks/morpho/useMorphoVault";
import {
  useDeployedContractInfo,
  usePermitDeposit,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

const VaultDetailPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<"position" | "overview" | "details">("position");
  const [actionTab, setActionTab] = useState<"deposit" | "withdraw">("deposit");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isMaxDeposit, setIsMaxDeposit] = useState(false);
  const [isMaxWithdraw, setIsMaxWithdraw] = useState(false);

  // Use permit deposit hook
  const { permitDeposit, isProcessing: isDepositing } = usePermitDeposit();

  // Determine asset decimals (USDC has 6 decimals)
  const inferredAssetDecimals = 6;

  // Read vault metadata
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

  // Read total vault stats
  const { data: totalAssets, refetch: refetchTotalAssets } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalAssets",
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useScaffoldReadContract({
    contractName: "vault",
    functionName: "totalSupply",
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

  // Read user-specific data
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

  // Read USDC data
  const { data: usdcBalance, refetch: refetchUsdcBalance } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Get vault contract address
  const { data: vaultContractInfo } = useDeployedContractInfo("vault");
  const vaultAddress = vaultContractInfo?.address;
  // Get APY from Morpho
  const { data: morphoData } = useMorphoVault(vaultAddress as string | undefined);

  // Write contracts
  const { writeContractAsync: writeVaultAsync } = useScaffoldWriteContract({ contractName: "vault" });

  // Format numbers for display
  const formatAmount = (value: bigint | undefined, decimalsValue: number | undefined) => {
    if (value === undefined || decimalsValue === undefined) return "...";
    const floatVal = parseFloat(formatUnits(value, decimalsValue));
    // Floor to 2 decimals to avoid showing more than available
    const floored = Math.floor(floatVal * 100) / 100;
    return floored.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate share price
  const sharePrice =
    totalAssets && totalSupply && totalSupply > 0n
      ? parseFloat(formatUnits(totalAssets, inferredAssetDecimals)) /
        parseFloat(formatUnits(totalSupply, vaultDecimals || 18))
      : 1;

  // Calculate fee percentage
  const feePercentage = vaultFee ? (Number(vaultFee) / 1e18) * 100 : 0;

  // Handle deposit with permit
  const handleDeposit = async () => {
    if (!depositAmount || !connectedAddress) return;

    try {
      await permitDeposit(depositAmount, inferredAssetDecimals, isMaxDeposit, usdcBalance);
      setDepositAmount("");
      setIsMaxDeposit(false);
      await Promise.all([
        refetchTotalAssets(),
        refetchTotalSupply(),
        refetchUserBalance(),
        refetchUserAssets(),
        refetchUsdcBalance(),
      ]);
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || !connectedAddress) return;

    try {
      setIsWithdrawing(true);
      let amount;
      if (isMaxWithdraw && maxWithdraw) {
        amount = maxWithdraw;
      } else {
        amount = parseUnits(withdrawAmount, inferredAssetDecimals);
      }
      await writeVaultAsync({
        functionName: "withdraw",
        args: [amount, connectedAddress, connectedAddress],
      });
      setWithdrawAmount("");
      setIsMaxWithdraw(false);
      await Promise.all([
        refetchTotalAssets(),
        refetchTotalSupply(),
        refetchUserBalance(),
        refetchUserAssets(),
        refetchUsdcBalance(),
      ]);
    } catch (error) {
      console.error("Error withdrawing:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-6">
        <div className="px-4 w-full max-w-7xl">
          <VaultHeader vaultName={vaultName} />

          <VaultMetrics
            totalAssets={totalAssets}
            formatAmount={formatAmount}
            assetDecimals={inferredAssetDecimals}
            apy={morphoData?.apy ?? 0}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <VaultDataTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              connectedAddress={connectedAddress}
              userAssets={userAssets}
              userBalance={userBalance}
              usdcBalance={usdcBalance}
              maxDeposit={maxDeposit}
              maxWithdraw={maxWithdraw}
              sharePrice={sharePrice}
              totalAssets={totalAssets}
              totalSupply={totalSupply}
              vaultDecimals={vaultDecimals}
              vaultName={vaultName}
              vaultSymbol={vaultSymbol}
              feePercentage={feePercentage}
              feeRecipient={feeRecipient}
              vaultAsset={vaultAsset}
              formatAmount={formatAmount}
              assetDecimals={inferredAssetDecimals}
            />

            <VaultActions
              actionTab={actionTab}
              setActionTab={setActionTab}
              connectedAddress={connectedAddress}
              depositAmount={depositAmount}
              setDepositAmount={setDepositAmount}
              usdcBalance={usdcBalance}
              isDepositing={isDepositing}
              handleDeposit={handleDeposit}
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              maxWithdraw={maxWithdraw}
              isWithdrawing={isWithdrawing}
              handleWithdraw={handleWithdraw}
              formatAmount={formatAmount}
              assetDecimals={inferredAssetDecimals}
              sharePrice={sharePrice}
              vaultDecimals={vaultDecimals}
              setIsMaxDeposit={setIsMaxDeposit}
              setIsMaxWithdraw={setIsMaxWithdraw}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VaultDetailPage;
