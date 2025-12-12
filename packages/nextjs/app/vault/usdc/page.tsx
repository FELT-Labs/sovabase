"use client";

import { useState } from "react";
import { VaultActions, VaultDataTabs, VaultHeader, VaultMetrics } from "./_components";
import type { VaultTab } from "./_components/VaultDataTabs";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useUsdcVaultData } from "~~/hooks/sovabase/useUsdcVaultData";

const UsdcVaultPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<VaultTab>("position");
  const vaultData = useUsdcVaultData();

  return (
    <>
      <div className="flex items-center flex-col grow pt-6">
        <div className="px-4 w-full max-w-7xl">
          <VaultHeader vaultName={vaultData.vaultName} />

          <VaultMetrics data={vaultData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            <VaultDataTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              connectedAddress={connectedAddress}
              data={vaultData}
            />

            <VaultActions data={vaultData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default UsdcVaultPage;
