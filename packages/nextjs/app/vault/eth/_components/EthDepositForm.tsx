import { formatUnits } from "viem";
import { EthDepositStep } from "~~/hooks/sovabase";
import { formatEthAmount } from "~~/utils/sovabase";

interface EthDepositFormProps {
  connectedAddress?: string;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  wethBalance?: bigint;
  isDepositing: boolean;
  handleDeposit: () => Promise<void>;
  assetDecimals: number;
  setIsMaxDeposit: (isMax: boolean) => void;
  depositStep: EthDepositStep;
}

const getDepositButtonText = (step: EthDepositStep) => {
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

export const EthDepositForm = ({
  connectedAddress,
  depositAmount,
  setDepositAmount,
  wethBalance,
  isDepositing,
  handleDeposit,
  assetDecimals,
  setIsMaxDeposit,
  depositStep,
}: EthDepositFormProps) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-base-content/60 mb-1 block">Deposit WETH</label>
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
              if (!wethBalance) return;
              const maxVal = parseFloat(formatUnits(wethBalance, assetDecimals));
              const floored = Math.floor(maxVal * 10000) / 10000;
              setDepositAmount(floored.toFixed(4));
              setIsMaxDeposit(true);
            }}
            disabled={!connectedAddress}
          >
            MAX
          </button>
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-1">
          <span>{depositAmount || "0"} WETH</span>
          <span>{formatEthAmount(wethBalance, assetDecimals)} WETH available</span>
        </div>
      </div>

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
