import { useState } from "react";
import { DepositForm } from "./DepositForm";
import { WithdrawForm } from "./WithdrawForm";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { VaultData, useVaultDeposit } from "~~/hooks/sovabase";
import { DEFAULT_ASSET_DECIMALS } from "~~/utils/sovabase";

interface VaultActionsProps {
  data: VaultData;
}

export const VaultActions = ({ data }: VaultActionsProps) => {
  const { address: connectedAddress } = useAccount();
  const { usdcBalance, maxWithdraw, sharePrice, vaultDecimals, apy, refetch } = data;

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
  const { deposit, isProcessing: isDepositing, currentStep } = useVaultDeposit();
  const { writeContractAsync: writeVaultAsync } = useScaffoldWriteContract({ contractName: "vault" });

  // Handlers
  const handleDeposit = async () => {
    if (!depositAmount || !connectedAddress) return;

    try {
      await deposit(depositAmount, DEFAULT_ASSET_DECIMALS, isMaxDeposit, usdcBalance);
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
      let amount;
      if (isMaxWithdraw && maxWithdraw) {
        amount = maxWithdraw;
      } else {
        amount = parseUnits(withdrawAmount, DEFAULT_ASSET_DECIMALS);
      }
      await writeVaultAsync({
        functionName: "withdraw",
        args: [amount, connectedAddress, connectedAddress],
      });
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
          <DepositForm
            connectedAddress={connectedAddress}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            usdcBalance={usdcBalance}
            isDepositing={isDepositing}
            handleDeposit={handleDeposit}
            assetDecimals={DEFAULT_ASSET_DECIMALS}
            setIsMaxDeposit={setIsMaxDeposit}
            apy={apy}
            depositStep={currentStep}
          />
        )}

        {/* Withdraw Form */}
        {actionTab === "withdraw" && (
          <WithdrawForm
            connectedAddress={connectedAddress}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            maxWithdraw={maxWithdraw}
            isWithdrawing={isWithdrawing}
            handleWithdraw={handleWithdraw}
            assetDecimals={DEFAULT_ASSET_DECIMALS}
            sharePrice={sharePrice}
            vaultDecimals={vaultDecimals}
            setIsMaxWithdraw={setIsMaxWithdraw}
          />
        )}
      </div>
    </div>
  );
};
