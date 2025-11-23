import { formatUnits } from "viem";

interface DepositFormProps {
  connectedAddress?: string;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  usdcBalance?: bigint;
  isDepositing: boolean;
  handleDeposit: () => Promise<void>;
  formatAmount: (value: bigint | undefined, decimals: number | undefined) => string;
  assetDecimals: number;
  setIsMaxDeposit: (isMax: boolean) => void;
}

export const DepositForm = ({
  connectedAddress,
  depositAmount,
  setDepositAmount,
  usdcBalance,
  isDepositing,
  handleDeposit,
  formatAmount,
  assetDecimals,
  setIsMaxDeposit,
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
            <span className="font-medium">9.45%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Projected monthly earnings</span>
            <span className="font-medium">${(parseFloat(depositAmount) * 0.0945 * (1 / 12)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-base-content/60">Projected yearly earnings</span>
            <span className="font-medium">${(parseFloat(depositAmount) * 0.0945).toFixed(2)}</span>
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
                Depositing...
              </>
            ) : (
              <>Deposit</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
