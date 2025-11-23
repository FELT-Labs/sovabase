import { formatUnits, parseUnits } from "viem";

interface WithdrawFormProps {
  connectedAddress?: string;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  maxWithdraw?: bigint;
  isWithdrawing: boolean;
  handleWithdraw: () => Promise<void>;
  formatAmount: (value: bigint | undefined, decimals: number | undefined) => string;
  assetDecimals: number;
  sharePrice: number;
  vaultDecimals?: number;
  setIsMaxWithdraw: (isMax: boolean) => void;
}

export const WithdrawForm = ({
  connectedAddress,
  withdrawAmount,
  setWithdrawAmount,
  maxWithdraw,
  isWithdrawing,
  handleWithdraw,
  formatAmount,
  assetDecimals,
  sharePrice,
  vaultDecimals,
  setIsMaxWithdraw,
}: WithdrawFormProps) => {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-base-content/60 mb-1 block">Withdraw USDC</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="0.00"
            className="input input-sm input-bordered w-full"
            value={withdrawAmount}
            onChange={e => {
              setWithdrawAmount(e.target.value);
              setIsMaxWithdraw(false);
            }}
            disabled={!connectedAddress}
          />
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => {
              if (!maxWithdraw) return;
              const maxVal = parseFloat(formatUnits(maxWithdraw, assetDecimals));
              const floored = Math.floor(maxVal * 100) / 100;
              setWithdrawAmount(floored.toFixed(2));
              setIsMaxWithdraw(true);
            }}
            disabled={!connectedAddress}
          >
            MAX
          </button>
        </div>
        <div className="flex justify-between text-xs text-base-content/60 mt-1">
          <span>${withdrawAmount || "0"}</span>
          <span>Available: {formatAmount(maxWithdraw, assetDecimals)} USDC</span>
        </div>
      </div>

      {withdrawAmount && (
        <div className="text-xs">
          <div className="flex justify-between">
            <span className="text-base-content/60">Shares to burn</span>
            <span className="font-medium">
              {formatAmount(
                parseUnits(withdrawAmount, assetDecimals) / BigInt(Math.floor(sharePrice * 1e6)),
                vaultDecimals,
              )}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2">
        {!connectedAddress ? (
          <button className="btn btn-secondary btn-sm w-full" disabled>
            Connect Wallet
          </button>
        ) : (
          <button
            className="btn btn-secondary btn-sm w-full"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || isWithdrawing}
          >
            {isWithdrawing ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Withdrawing...
              </>
            ) : (
              <>Withdraw</>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
