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
  needsApproval: boolean;
  isApproving: boolean;
  isDepositing: boolean;
  handleApprove: () => Promise<void>;
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
}

export const VaultActions = ({
  actionTab,
  setActionTab,
  connectedAddress,
  depositAmount,
  setDepositAmount,
  usdcBalance,
  needsApproval,
  isApproving,
  isDepositing,
  handleApprove,
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
            needsApproval={needsApproval}
            isApproving={isApproving}
            isDepositing={isDepositing}
            handleApprove={handleApprove}
            handleDeposit={handleDeposit}
            formatAmount={formatAmount}
            assetDecimals={assetDecimals}
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
          />
        )}
      </div>
    </div>
  );
};
