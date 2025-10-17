import Link from "next/link";

interface VaultHeaderProps {
  vaultName?: string;
}

export const VaultHeader = ({ vaultName }: VaultHeaderProps) => {
  return (
    <>
      {/* Back Button */}
      <Link href="/" className="btn btn-ghost btn-sm mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Link>

      {/* Header with Vault Name */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-3xl">💵</div>
          <h1 className="text-3xl font-bold">{vaultName || "USDC Vault"}</h1>
        </div>
        <p className="text-sm text-base-content/60">Automatic rebalancing across DeFi protocols</p>
      </div>
    </>
  );
};
