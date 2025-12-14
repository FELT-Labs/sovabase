import { useState } from "react";
import { EthDepositForm } from "./EthDepositForm";
import { EthWithdrawForm } from "./EthWithdrawForm";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { EthVaultData, useEthVaultDeposit } from "~~/hooks/sovabase";
import { DEFAULT_ETH_DECIMALS } from "~~/utils/sovabase";

interface EthVaultActionsProps {
  data: EthVaultData;
}

export const EthVaultActions = ({ data }: EthVaultActionsProps) => {
  const { address: connectedAddress } = useAccount();
  const { wethBalance, maxWithdraw, userAssets, userBalance, sharePrice, vaultDecimals, refetch } = data;

  // Use userAssets as fallback if maxWithdraw is 0 or undefined
  const availableToWithdraw = maxWithdraw && maxWithdraw > 0n ? maxWithdraw : userAssets;

  // Component State
  const [actionTab, setActionTab] = useState<"deposit" | "withdraw">("deposit");

  // Deposit State
  const [depositAmount, setDepositAmount] = useState("");
  const [isMaxDeposit, setIsMaxDeposit] = useState(false);

  // Withdraw State
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isMaxWithdraw, setIsMaxWithdraw] = useState(false);

  // Hooks
  const { deposit, isProcessing: isDepositing, currentStep } = useEthVaultDeposit();
  const { writeContractAsync: writeVaultAsync } = useScaffoldWriteContract({ contractName: "ethVault" });

  // Handlers
  const handleDeposit = async () => {
    if (!depositAmount || !connectedAddress) return;

    try {
      await deposit(depositAmount, DEFAULT_ETH_DECIMALS, isMaxDeposit, wethBalance);
      setDepositAmount("");
      setIsMaxDeposit(false);
      await refetch();
    } catch (error) {
      console.error("Error depositing:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !connectedAddress) return;

    try {
      setIsWithdrawing(true);

      // Use redeem (burn shares) for max withdraw to avoid dust
      // Use withdraw (specify assets) for partial withdrawals
      if (isMaxWithdraw && userBalance && userBalance > 0n) {
        // Redeem all shares - this avoids rounding issues
        await writeVaultAsync({
          functionName: "redeem",
          args: [userBalance, connectedAddress, connectedAddress],
        });
      } else {
        // Partial withdrawal by asset amount
        const amount = parseUnits(withdrawAmount, DEFAULT_ETH_DECIMALS);
        await writeVaultAsync({
          functionName: "withdraw",
          args: [amount, connectedAddress, connectedAddress],
        });
      }

      setWithdrawAmount("");
      setIsMaxWithdraw(false);
      await refetch();
    } catch (error) {
      console.error("Error withdrawing:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="lg:col-span-1">
      <div className="bg-base-100 rounded-xl p-4 shadow-sm sticky top-4">
        {/* Action Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            className={`btn btn-sm flex-1 ${actionTab === "deposit" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActionTab("deposit")}
          >
            Deposit
          </button>
          <button
            className={`btn btn-sm flex-1 ${actionTab === "withdraw" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActionTab("withdraw")}
          >
            Withdraw
          </button>
        </div>

        {/* Deposit Form */}
        {actionTab === "deposit" && (
          <EthDepositForm
            connectedAddress={connectedAddress}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            wethBalance={wethBalance}
            isDepositing={isDepositing}
            handleDeposit={handleDeposit}
            assetDecimals={DEFAULT_ETH_DECIMALS}
            setIsMaxDeposit={setIsMaxDeposit}
            depositStep={currentStep}
          />
        )}

        {/* Withdraw Form */}
        {actionTab === "withdraw" && (
          <EthWithdrawForm
            connectedAddress={connectedAddress}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            maxWithdraw={availableToWithdraw}
            isWithdrawing={isWithdrawing}
            handleWithdraw={handleWithdraw}
            assetDecimals={DEFAULT_ETH_DECIMALS}
            sharePrice={sharePrice}
            vaultDecimals={vaultDecimals}
            setIsMaxWithdraw={setIsMaxWithdraw}
          />
        )}
      </div>
    </div>
  );
};
