import { useEffect, useState } from "react";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";

export type ApyDataPoint = {
  timestamp: number;
  date: string;
  apy: number;
};

export type DepositsDataPoint = {
  timestamp: number;
  date: string;
  deposits: number;
};

export type TimeRange = "1W" | "1M" | "3M";

type MorphoHistoryData = {
  apyHistory: ApyDataPoint[];
  avgApy: number;
  currentApy: number;
  depositsHistory: DepositsDataPoint[];
  currentDeposits: number;
};

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
};

export function useMorphoVaultHistory(vaultAddress?: string, timeRange: TimeRange = "1M") {
  const selectedNetwork = useSelectedNetwork();

  const [data, setData] = useState<MorphoHistoryData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!vaultAddress || !selectedNetwork?.id) return;

    let cancelled = false;

    const fetchMorphoHistory = async () => {
      setLoading(true);
      setError(undefined);

      try {
        // Calculate timestamps for the time range
        const now = Math.floor(Date.now() / 1000);
        const startTimestamp = now - TIME_RANGE_DAYS[timeRange] * 24 * 60 * 60;

        // Query Morpho API for historical APY and deposits data using historicalState
        // FloatDataPoint has x (timestamp) and y (value)
        const query = `
          query {
            vaultByAddress(address: "${vaultAddress}", chainId: ${selectedNetwork.id}) {
              address
              state {
                apy
                netApy
                avgApy
                totalAssetsUsd
              }
              historicalState {
                apy(options: { startTimestamp: ${startTimestamp}, endTimestamp: ${now}, interval: DAY }) {
                  x
                  y
                }
                totalAssetsUsd(options: { startTimestamp: ${startTimestamp}, endTimestamp: ${now}, interval: DAY }) {
                  x
                  y
                }
              }
            }
          }
        `;

        const res = await fetch("https://api.morpho.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) throw new Error(`GraphQL fetch failed: ${res.status} ${res.statusText}`);

        const json = await res.json();

        // Check for GraphQL errors
        if (json.errors) {
          throw new Error(json.errors[0]?.message || "GraphQL query failed");
        }

        const vault = json?.data?.vaultByAddress;

        if (!vault || cancelled) {
          if (!cancelled) setData(undefined);
          return;
        }

        const state = vault.state;
        const apyHistory = vault.historicalState?.apy || [];
        const depositsHistory = vault.historicalState?.totalAssetsUsd || [];

        // Transform APY data - x is already in seconds, y is the APY value (not percentage)
        const transformedApyHistory: ApyDataPoint[] = apyHistory
          .filter((point: { x: number; y: number | null }) => point.y !== null)
          .map((point: { x: number; y: number }) => ({
            timestamp: point.x * 1000, // Convert to milliseconds for JS Date
            date: new Date(point.x * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            apy: point.y * 100, // Convert to percentage
          }))
          .sort((a: ApyDataPoint, b: ApyDataPoint) => a.timestamp - b.timestamp);

        // Transform deposits data - y is already in USD
        const transformedDepositsHistory: DepositsDataPoint[] = depositsHistory
          .filter((point: { x: number; y: number | null }) => point.y !== null)
          .map((point: { x: number; y: number }) => ({
            timestamp: point.x * 1000,
            date: new Date(point.x * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            deposits: point.y,
          }))
          .sort((a: DepositsDataPoint, b: DepositsDataPoint) => a.timestamp - b.timestamp);

        // Calculate average from the historical data
        const avgApy =
          transformedApyHistory.length > 0
            ? transformedApyHistory.reduce((sum: number, p: ApyDataPoint) => sum + p.apy, 0) /
              transformedApyHistory.length
            : state?.avgApy
              ? Number(state.avgApy) * 100
              : 0;

        setData({
          apyHistory: transformedApyHistory,
          avgApy,
          currentApy: state?.apy ? Number(state.apy) * 100 : 0,
          depositsHistory: transformedDepositsHistory,
          currentDeposits: state?.totalAssetsUsd ? Number(state.totalAssetsUsd) : 0,
        });
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMorphoHistory();

    return () => {
      cancelled = true;
    };
  }, [vaultAddress, selectedNetwork?.id, timeRange]);

  return { data, loading, error };
}

export default useMorphoVaultHistory;
