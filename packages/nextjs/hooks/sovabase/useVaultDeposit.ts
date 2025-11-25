import { useState } from "react";
import { type Address, parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { createSafeBatchedDeposit, isContractWallet } from "~~/utils/sovabase";

export type DepositStep = "idle" | "approving" | "depositing" | "completed" | "error";

/**
 * Hook for handling vault deposits with approval flow
 * Automatically detects Safe wallets and batches transactions
 *
 * Workflow:
 * - EOA wallets: 2 separate transactions (approve, then deposit)
 * - Safe wallets: 1 batched transaction (approve + deposit atomically)
 */
export function useVaultDeposit() {
  const { address: connectedAddress, chain } = useAccount();
  const publicClient = usePublicClient();
  const [currentStep, setCurrentStep] = useState<DepositStep>("idle");

  const { data: vaultContractInfo } = useDeployedContractInfo("vault");
  const vaultAddress = vaultContractInfo?.address;

  const { data: usdcContractInfo } = useDeployedContractInfo("usdc");
  const usdcAddress = usdcContractInfo?.address;

  // Read current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "allowance",
    args: [connectedAddress, vaultAddress],
  });

  const { writeContractAsync: writeUsdcAsync } = useScaffoldWriteContract({ contractName: "usdc" });
  const { writeContractAsync: writeVaultAsync } = useScaffoldWriteContract({ contractName: "vault" });

  /**
   * Deposit with Safe batched transactions
   * Creates a single Safe transaction containing both approve and deposit
   */
  const depositWithSafe = async (amount: bigint): Promise<boolean> => {
    if (!connectedAddress || !vaultAddress || !usdcAddress || !chain) {
      throw new Error("Missing required data for Safe deposit");
    }

    setCurrentStep("approving");

    try {
      const txHash = await createSafeBatchedDeposit({
        safeAddress: connectedAddress as Address,
        usdcAddress: usdcAddress as Address,
        vaultAddress: vaultAddress as Address,
        amount,
        receiver: connectedAddress as Address,
        chainId: chain.id,
      });

      console.log("✅ Safe batched transaction created:", txHash);
      console.log("Please sign and execute the transaction in your Safe wallet");

      setCurrentStep("depositing");

      // Note: For Safe, we can't wait for transaction execution here
      // as it requires M-of-N signatures collected through Safe UI
      // The transaction will be in pending state until executed

      setCurrentStep("completed");
      return true;
    } catch (error) {
      console.error("Error in Safe batched deposit:", error);
      throw error;
    }
  };

  /**
   * Standard sequential deposit for EOA wallets
   * Two separate transactions: approve then deposit
   */
  const depositSequential = async (amount: bigint): Promise<boolean> => {
    if (!connectedAddress || !vaultAddress || !publicClient) {
      throw new Error("Missing required data for deposit");
    }

    try {
      // Check if approval is needed
      const needsApproval = !currentAllowance || currentAllowance < amount;

      if (needsApproval) {
        // Step 1: Approve
        setCurrentStep("approving");
        const approveHash = await writeUsdcAsync({
          functionName: "approve",
          args: [vaultAddress, amount],
        });

        if (!approveHash) {
          throw new Error("Approval transaction failed");
        }

        // Wait for approval to be mined
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // Refetch allowance to update state
        await refetchAllowance();
      }

      // Step 2: Deposit
      setCurrentStep("depositing");
      const depositHash = await writeVaultAsync({
        functionName: "deposit",
        args: [amount, connectedAddress],
      });

      if (!depositHash) {
        throw new Error("Deposit transaction failed");
      }

      // Wait for deposit to be mined
      await publicClient.waitForTransactionReceipt({ hash: depositHash });

      setCurrentStep("completed");
      return true;
    } catch (error) {
      console.error("Error in sequential deposit:", error);
      throw error;
    }
  };

  /**
   * Main deposit function
   * Automatically detects wallet type and uses appropriate flow
   */
  const deposit = async (depositAmount: string, assetDecimals: number, isMaxDeposit: boolean, usdcBalance?: bigint) => {
    if (!connectedAddress || !vaultAddress || !publicClient) {
      throw new Error("Missing required data for deposit");
    }

    setCurrentStep("idle");

    try {
      // Calculate amount
      const amount = isMaxDeposit && usdcBalance ? usdcBalance : parseUnits(depositAmount, assetDecimals);

      // Detect wallet type
      const isSafe = await isContractWallet(connectedAddress as Address, publicClient);

      // Check if approval is needed
      const needsApproval = !currentAllowance || currentAllowance < amount;

      if (isSafe && needsApproval) {
        // Use Safe batching for contract wallets when approval is needed
        console.log("🔐 Safe wallet detected - creating batched transaction");
        return await depositWithSafe(amount);
      } else {
        // Use sequential flow for EOA or if already approved
        return await depositSequential(amount);
      }
    } catch (error) {
      console.error("Error in deposit:", error);
      setCurrentStep("error");
      throw error;
    }
  };

  const isProcessing = currentStep === "approving" || currentStep === "depositing";

  return {
    deposit,
    currentStep,
    isProcessing,
    currentAllowance,
  };
}
