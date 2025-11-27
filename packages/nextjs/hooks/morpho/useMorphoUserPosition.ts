import { useEffect, useState } from "react";
import { type TimeRange } from "./useMorphoVaultHistory";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";

export type PositionDataPoint = {
  timestamp: number;
  date: string;
  value: number;
};

type MorphoUserPositionData = {
  // Position stats
  pnl: number; // In underlying asset (USDC)
  roe: number; // Return on equity as percentage
  // Historical position value
  positionHistory: PositionDataPoint[];
};

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "1W": 7,
  "1M": 30,
  "3M": 90,
};

export function useMorphoUserPosition(vaultAddress?: string, userAddress?: string, timeRange: TimeRange = "1M") {
  const selectedNetwork = useSelectedNetwork();

  const [data, setData] = useState<MorphoUserPositionData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!vaultAddress || !userAddress || !selectedNetwork?.id) return;

    let cancelled = false;

    const fetchUserPosition = async () => {
      setLoading(true);
      setError(undefined);

      try {
        // Calculate timestamps for the time range
        const now = Math.floor(Date.now() / 1000);
        const startTimestamp = now - TIME_RANGE_DAYS[timeRange] * 24 * 60 * 60;

        // Query Morpho API for user vault position
        const query = `
          query {
            vaultPosition(
              vaultAddress: "${vaultAddress}",
              userAddress: "${userAddress}",
              chainId: ${selectedNetwork.id}
            ) {
              state {
                pnl
                roe
                assets
              }
              historicalState {
                assets(options: { startTimestamp: ${startTimestamp}, endTimestamp: ${now}, interval: DAY }) {
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

        // Check for GraphQL errors - position might not exist
        if (json.errors) {
          // If position doesn't exist, return empty data (not an error)
          if (!cancelled) {
            setData({
              pnl: 0,
              roe: 0,
              positionHistory: [],
            });
          }
          return;
        }

        const position = json?.data?.vaultPosition;

        if (!position || cancelled) {
          if (!cancelled) {
            setData({
              pnl: 0,
              roe: 0,
              positionHistory: [],
            });
          }
          return;
        }

        const state = position.state;
        const assetsHistory = position.historicalState?.assets || [];

        // Transform historical data - values are in underlying asset units (need to convert from BigInt string)
        const transformedHistory: PositionDataPoint[] = assetsHistory
          .filter((point: { x: number; y: string | null }) => point.y !== null)
          .map((point: { x: number; y: string }) => ({
            timestamp: point.x * 1000,
            date: new Date(point.x * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: Number(point.y) / 1e6, // Convert from 6 decimals (USDC)
          }))
          .sort((a: PositionDataPoint, b: PositionDataPoint) => a.timestamp - b.timestamp);

        setData({
          pnl: state?.pnl ? Number(state.pnl) / 1e6 : 0, // Convert from 6 decimals
          roe: state?.roe ? Number(state.roe) * 100 : 0, // Convert to percentage
          positionHistory: transformedHistory,
        });
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUserPosition();

    return () => {
      cancelled = true;
    };
  }, [vaultAddress, userAddress, selectedNetwork?.id, timeRange]);

  return { data, loading, error };
}

export default useMorphoUserPosition;
