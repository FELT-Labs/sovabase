import { formatUnits } from "viem";

export const DEFAULT_ASSET_DECIMALS = 6;

export const formatAmount = (value: bigint | undefined, decimalsValue: number | undefined): string => {
  if (value === undefined || decimalsValue === undefined) return "...";
  const floatVal = parseFloat(formatUnits(value, decimalsValue));
  // Floor to 2 decimals
  const floored = Math.floor(floatVal * 100) / 100;
  return floored.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export * from "./safe";
