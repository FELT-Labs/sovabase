import { formatUnits } from "viem";

export const DEFAULT_USDC_DECIMALS = 6;
export const DEFAULT_ETH_DECIMALS = 18;

export const formatAmount = (
  value: bigint | undefined,
  decimalsValue: number | undefined,
  displayDecimals: number = 2,
): string => {
  if (value === undefined || decimalsValue === undefined) return "...";
  const floatVal = parseFloat(formatUnits(value, decimalsValue));
  const multiplier = Math.pow(10, displayDecimals);
  const floored = Math.floor(floatVal * multiplier) / multiplier;
  return floored.toLocaleString(undefined, {
    minimumFractionDigits: displayDecimals,
    maximumFractionDigits: displayDecimals,
  });
};

// Helper for ETH amounts (4 decimals)
export const formatEthAmount = (value: bigint | undefined, decimalsValue: number | undefined): string => {
  return formatAmount(value, decimalsValue, 4);
};
