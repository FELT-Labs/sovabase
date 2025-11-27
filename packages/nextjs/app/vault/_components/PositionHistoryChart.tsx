"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMorphoUserPosition } from "~~/hooks/morpho/useMorphoUserPosition";
import { type TimeRange } from "~~/hooks/morpho/useMorphoVaultHistory";

interface PositionHistoryChartProps {
  vaultAddress?: string;
  userAddress?: string;
  currentValue: number;
}

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "1W", label: "1 week" },
  { value: "1M", label: "1 month" },
  { value: "3M", label: "3 months" },
];

// Format USDC value
const formatUsdc = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

export const PositionHistoryChart = ({ vaultAddress, userAddress, currentValue }: PositionHistoryChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");
  const { data, loading, error } = useMorphoUserPosition(vaultAddress, userAddress, timeRange);

  // If no user connected or no position, show empty state
  if (!userAddress) {
    return (
      <div className="flex items-center justify-center h-[150px] text-base-content/60">
        <p className="text-sm">Connect wallet to view position history</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[150px] text-base-content/60">
        <p className="text-sm">Failed to load position history</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[150px]">
        <span className="loading loading-spinner loading-sm text-accent"></span>
      </div>
    );
  }

  const positionHistory = data?.positionHistory || [];

  // If no history but user has position, create a simple chart with current value
  const chartData =
    positionHistory.length > 0
      ? positionHistory
      : currentValue > 0
        ? [{ timestamp: Date.now(), date: "Now", value: currentValue }]
        : [];

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.value)) * 1.1 : currentValue * 1.1 || 100;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-base-content/60 uppercase tracking-wide">Position Value</span>
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
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="positionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(var(--color-base-content) / 0.4)", fontSize: 9 }}
                dy={5}
                interval="preserveStartEnd"
              />

              <YAxis
                domain={[0, maxValue]}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "oklch(var(--color-base-content) / 0.4)", fontSize: 9 }}
                tickFormatter={value => formatUsdc(value)}
                width={45}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(var(--color-base-200))",
                  border: "1px solid oklch(var(--color-base-300))",
                  borderRadius: "8px",
                  padding: "6px 10px",
                }}
                labelStyle={{ color: "oklch(var(--color-base-content) / 0.6)", fontSize: 10, marginBottom: 2 }}
                itemStyle={{ color: "#10b981", fontWeight: 600 }}
                formatter={(value: number) => [`${formatUsdc(value)} USDC`, "Value"]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#positionGradient)"
                dot={false}
                activeDot={{
                  r: 3,
                  fill: "#10b981",
                  stroke: "oklch(var(--color-base-100))",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[120px] text-base-content/60">
          <p className="text-xs">No position history available</p>
        </div>
      )}
    </div>
  );
};
