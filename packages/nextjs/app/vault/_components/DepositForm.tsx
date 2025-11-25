import { formatUnits } from "viem";
import { DepositStep } from "~~/hooks/sovabase";
import { formatAmount } from "~~/utils/sovabase";

interface DepositFormProps {
  connectedAddress?: string;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  usdcBalance?: bigint;
  isDepositing: boolean;
  handleDeposit: () => Promise<void>;
  assetDecimals: number;
  setIsMaxDeposit: (isMax: boolean) => void;
  apy?: number;
  depositStep: DepositStep;
}

const getDepositButtonText = (step: DepositStep) => {
  switch (step) {
    case "approving":
      return "Approving...";
    case "depositing":
      return "Depositing...";
    case "completed":
      return "Deposit";
    case "error":
      return "Try Again";
    default:
      return "Deposit";
  }
};

export const DepositForm = ({
  connectedAddress,
  depositAmount,
  setDepositAmount,
  usdcBalance,
  isDepositing,
  handleDeposit,
  assetDecimals,
  setIsMaxDeposit,
  apy,
  depositStep,
}: DepositFormProps) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-base-content/60 mb-1 block">Deposit USDC</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.00"
            className="input input-sm input-bordered w-full"
            value={depositAmount}
            onChange={e => {
              setDepositAmount(e.target.value);
              setIsMaxDeposit(false);
            }}
            disabled={!connectedAddress}
          />
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              if (!usdcBalance) return;
              const maxVal = parseFloat(formatUnits(usdcBalance, assetDecimals));
              const floored = Math.floor(maxVal * 100) / 100;
              setDepositAmount(floored.toFixed(2));
              setIsMaxDeposit(true);
            }}
            disabled={!connectedAddress}
          >
            MAX
          </button>
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-1">
          <span>${depositAmount || "0"}</span>
          <span>{formatAmount(usdcBalance, assetDecimals)} USDC</span>
        </div>
      </div>

      {depositAmount && (
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-base-content/60">APY</span>
            <span className="font-medium">{apy !== undefined ? `${(apy * 100).toFixed(2)}%` : "..."}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Projected monthly earnings</span>
            <span className="font-medium">
              {apy !== undefined ? `$${(parseFloat(depositAmount) * apy * (1 / 12)).toFixed(2)}` : "..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Projected yearly earnings</span>
            <span className="font-medium">
              {apy !== undefined ? `$${(parseFloat(depositAmount) * apy).toFixed(2)}` : "..."}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2">
        {!connectedAddress ? (
          <button className="btn btn-primary btn-sm w-full" disabled>
            Connect Wallet
          </button>
        ) : (
          <button
            className="btn btn-primary btn-sm w-full"
            onClick={handleDeposit}
            disabled={!depositAmount || isDepositing}
          >
            {isDepositing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                {getDepositButtonText(depositStep)}
              </>
            ) : (
              <>{getDepositButtonText(depositStep)}</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
