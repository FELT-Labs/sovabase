import Link from "next/link";
import { formatAmount } from "~~/utils/sovabase";

interface VaultCardProps {
  name: string;
  symbol: string;
  totalAssets: bigint | undefined;
  userAssets: bigint | undefined;
  decimals: number | undefined;
  assetDecimals: number;
  href: string;
  isComingSoon?: boolean;
  icon: React.ReactNode;
  assetName: string;
}

export const VaultCard = ({
  name,
  symbol,
  totalAssets,
  userAssets,
  decimals,
  assetDecimals,
  href,
  isComingSoon = false,
  icon,
  assetName,
}: VaultCardProps) => {
  const CardContent = (
    <div
      className={`bg-base-100 rounded-xl p-4 shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 ${
        isComingSoon
          ? "border-base-300 opacity-75 group-hover:shadow-xl"
          : "border-transparent hover:border-primary hover:shadow-xl"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold">{name}</h2>
          <p className="text-xs text-base-content/70">{symbol || ""}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-base-200 rounded-lg p-2">
          <p className="text-xs text-base-content/60">
            <span className="tooltip tooltip-top tooltip-accent" data-tip="The total assets deposited in the vault">
              Deposits
            </span>
          </p>
          <p className="text-lg font-bold">{isComingSoon ? "--" : formatAmount(totalAssets, assetDecimals)}</p>
          <p className="text-xs text-base-content/50">{assetName}</p>
        </div>

        <div className="bg-base-200 rounded-lg p-2">
          <p className="text-xs text-base-content/60">Your Balance</p>
          <p className="text-lg font-bold">
            {isComingSoon ? "--" : userAssets ? formatAmount(userAssets, decimals) : "0.00"}
          </p>
          <p className="text-xs text-base-content/50">{assetName}</p>
        </div>
      </div>

      {isComingSoon && (
        <div className="absolute top-2 right-2 bg-warning text-warning-content px-2 py-1 rounded-full font-semibold text-xs shadow-lg">
          🚧 Coming Soon
        </div>
      )}
    </div>
  );

  if (isComingSoon) {
    return <div className="relative group cursor-not-allowed">{CardContent}</div>;
  }

  return (
    <Link href={href} className="group">
      {CardContent}
    </Link>
  );
};
