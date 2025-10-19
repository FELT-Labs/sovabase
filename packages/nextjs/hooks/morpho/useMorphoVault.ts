import { useEffect, useState } from "react";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";

type MorphoApy = {
  apy?: number | undefined;
  netApy?: number | undefined;
  avgApy?: number | undefined;
};

export function useMorphoVault(vaultAddress?: string) {
  const selectedNetwork = useSelectedNetwork();

  const [data, setData] = useState<MorphoApy | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!vaultAddress || !selectedNetwork?.id) return;

    let cancelled = false;

    const fetchMorphoApy = async () => {
      setLoading(true);
      setError(undefined);

      try {
        const query = `query { vaultByAddress(address: "${vaultAddress}", chainId: ${selectedNetwork.id}) { address state { apy netApy avgApy } } }`;

        const res = await fetch("https://api.morpho.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });

        if (!res.ok) throw new Error(`GraphQL fetch failed: ${res.status} ${res.statusText}`);

        const json = await res.json();
        const state = json?.data?.vaultByAddress?.state;

        if (!state || cancelled) {
          if (!cancelled) setData(undefined);
          return;
        }

        setData({
          apy: state.apy !== null && state.apy !== undefined ? Number(state.apy) : undefined,
          netApy: state.netApy !== null && state.netApy !== undefined ? Number(state.netApy) : undefined,
          avgApy: state.avgApy !== null && state.avgApy !== undefined ? Number(state.avgApy) : undefined,
        });
      } catch (e: any) {
        if (!cancelled) setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMorphoApy();

    return () => {
      cancelled = true;
    };
  }, [vaultAddress, selectedNetwork?.id]);

  return { data, loading, error } as {
    data?: MorphoApy | undefined;
    loading: boolean;
    error?: Error | undefined;
  };
}

export default useMorphoVault;
