import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export type EthDepositStep = "idle" | "approving" | "depositing" | "completed" | "error";

export function useEthVaultDeposit() {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const [currentStep, setCurrentStep] = useState<EthDepositStep>("idle");

  const { data: vaultContractInfo } = useDeployedContractInfo("ethVault");
  const vaultAddress = vaultContractInfo?.address;

  // Read current allowance
  const { data: currentAllowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "weth",
    functionName: "allowance",
    args: [connectedAddress, vaultAddress],
  });

  const { writeContractAsync: writeWethAsync } = useScaffoldWriteContract({ contractName: "weth" });
  const { writeContractAsync: writeVaultAsync } = useScaffoldWriteContract({ contractName: "ethVault" });

  const deposit = async (depositAmount: string, assetDecimals: number, isMaxDeposit: boolean, wethBalance?: bigint) => {
    if (!connectedAddress || !vaultAddress || !publicClient) {
      throw new Error("Missing required data for deposit");
    }

    setCurrentStep("idle");

    try {
      // Calculate amount
      let amount: bigint;
      if (isMaxDeposit && wethBalance) {
        amount = wethBalance;
      } else {
        amount = parseUnits(depositAmount, assetDecimals);
      }

      // Check if approval is needed
      const needsApproval = !currentAllowance || currentAllowance < amount;

      if (needsApproval) {
        // Step 1: Approve
        setCurrentStep("approving");
        const approveHash = await writeWethAsync({
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
