"use client";

import { useState } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { type TimeRange, useMorphoVaultHistory } from "~~/hooks/morpho/useMorphoVaultHistory";

type ChartType = "apy" | "deposits";

interface VaultHistoryChartProps {
  vaultAddress?: string;
  chartType: ChartType;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1W", label: "1 week" },
  { value: "1M", label: "1 month" },
  { value: "3M", label: "3 months" },
];

// Format large numbers (e.g., 420340000 -> "$420.34M")
const formatUsdValue = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

// Format for Y-axis (shorter)
const formatYAxisUsd = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(0)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

export const VaultHistoryChart = ({ vaultAddress, chartType }: VaultHistoryChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const { data, loading, error } = useMorphoVaultHistory(vaultAddress, timeRange);

  const isApyChart = chartType === "apy";
  const gradientId = isApyChart ? "apyGradient" : "depositsGradient";

  if (error) {
    return (
      <div className="flex items-center justify-center h-[200px] text-base-content/60">
        <p>Failed to load {isApyChart ? "APY" : "deposits"} history</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <span className="loading loading-spinner loading-md text-accent"></span>
      </div>
    );
  }

  const { apyHistory, avgApy, currentApy, depositsHistory, currentDeposits } = data;

  // Calculate min/max for Y-axis
  // APY: start from 0 to show full context
  const apyValues = apyHistory.map(d => d.apy);
  const maxApy = apyValues.length > 0 ? Math.max(...apyValues, avgApy) * 1.1 : 10;

  // Deposits: always start from 0 to show meaningful scale
  const depositsValues = depositsHistory.map(d => d.deposits);
  const maxDeposits = depositsValues.length > 0 ? Math.max(...depositsValues) * 1.1 : 1000000;

  const chartData = isApyChart ? apyHistory : depositsHistory;
  const dataKey = isApyChart ? "apy" : "deposits";

  return (
    <div className="space-y-3">
      {/* Header with value and time selector */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">
              {isApyChart ? "APY" : "Total Deposits (USD)"}
            </span>
            <span className="text-base-content/40">✦</span>
          </div>
          <p className="text-3xl font-bold text-accent">
            {isApyChart ? `${currentApy.toFixed(2)}%` : formatUsdValue(currentDeposits)}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-xs btn-ghost gap-1 text-base-content/70">
            {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-200 rounded-box w-28 z-10">
            {TIME_RANGE_OPTIONS.map(option => (
              <li key={option.value}>
                <button
                  className={`text-xs ${timeRange === option.value ? "active" : ""}`}
                  onClick={() => setTimeRange(option.value)}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(var(--color-accent))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="oklch(var(--color-accent))" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(var(--color-base-content) / 0.4)", fontSize: 10 }}
                dy={8}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[0, isApyChart ? maxApy : maxDeposits]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(var(--color-base-content) / 0.4)", fontSize: 10 }}
                tickFormatter={value => (isApyChart ? `${value.toFixed(1)}%` : formatYAxisUsd(value))}
                width={55}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(var(--color-base-200))",
                  border: "1px solid oklch(var(--color-base-300))",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                labelStyle={{ color: "oklch(var(--color-base-content) / 0.6)", fontSize: 11, marginBottom: 4 }}
                itemStyle={{ color: "oklch(var(--color-accent))", fontWeight: 600 }}
                formatter={(value: number) =>
                  isApyChart ? [`${value.toFixed(2)}%`, "APY"] : [formatUsdValue(value), "Deposits"]
                }
              />

              {/* Average reference line (only for APY) */}
              {isApyChart && (
                <ReferenceLine
                  y={avgApy}
                  stroke="oklch(var(--color-base-content) / 0.3)"
                  strokeDasharray="4 4"
                  label={{
                    value: `Avg ${avgApy.toFixed(2)}%`,
                    position: "left",
                    fill: "oklch(var(--color-base-content) / 0.5)",
                    fontSize: 10,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="oklch(var(--color-accent))"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{
                  r: 3,
                  fill: "oklch(var(--color-accent))",
                  stroke: "oklch(var(--color-base-100))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[180px] text-base-content/60">
          <p className="text-sm">No historical data available</p>
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-2 border-t border-base-300">
        {isApyChart ? (
          <>
            <div>
              <p className="text-xs text-base-content/50">Average</p>
              <p className="text-sm font-semibold">{avgApy.toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-xs text-base-content/50">Current</p>
              <p className="text-sm font-semibold text-accent">{currentApy.toFixed(2)}%</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs text-base-content/50">Current</p>
              <p className="text-sm font-semibold text-accent">{formatUsdValue(currentDeposits)}</p>
            </div>
            {depositsHistory.length > 0 && (
              <div>
                <p className="text-xs text-base-content/50">Period Start</p>
                <p className="text-sm font-semibold">{formatUsdValue(depositsHistory[0].deposits)}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
