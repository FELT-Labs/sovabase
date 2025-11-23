import { DepositForm } from "./DepositForm";
import { WithdrawForm } from "./WithdrawForm";

interface VaultActionsProps {
  actionTab: "deposit" | "withdraw";
  setActionTab: (tab: "deposit" | "withdraw") => void;
  connectedAddress?: string;
  // Deposit props
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  usdcBalance?: bigint;
  isDepositing: boolean;
  handleDeposit: () => Promise<void>;
  // Withdraw props
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  maxWithdraw?: bigint;
  isWithdrawing: boolean;
  handleWithdraw: () => Promise<void>;
  // Common props
  formatAmount: (value: bigint | undefined, decimals: number | undefined) => string;
  assetDecimals: number;
  sharePrice: number;
  vaultDecimals?: number;
  setIsMaxDeposit: (isMax: boolean) => void;
  setIsMaxWithdraw: (isMax: boolean) => void;
}

export const VaultActions = ({
  actionTab,
  setActionTab,
  connectedAddress,
  depositAmount,
  setDepositAmount,
  usdcBalance,
  isDepositing,
  handleDeposit,
  withdrawAmount,
  setWithdrawAmount,
  maxWithdraw,
  isWithdrawing,
  handleWithdraw,
  formatAmount,
  assetDecimals,
  sharePrice,
  vaultDecimals,
  setIsMaxDeposit,
  setIsMaxWithdraw,
}: VaultActionsProps) => {
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
            formatAmount={formatAmount}
            assetDecimals={assetDecimals}
            setIsMaxDeposit={setIsMaxDeposit}
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
            formatAmount={formatAmount}
            assetDecimals={assetDecimals}
            sharePrice={sharePrice}
            vaultDecimals={vaultDecimals}
            setIsMaxWithdraw={setIsMaxWithdraw}
          />
        )}
      </div>
    </div>
  );
};
