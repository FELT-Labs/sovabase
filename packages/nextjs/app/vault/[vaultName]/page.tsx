"use client";

import { useState } from "react";
import { VaultActions, VaultDataTabs, VaultHeader, VaultMetrics } from "../_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useVaultData } from "~~/hooks/sovabase/useVaultData";

const VaultDetailPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<"position" | "overview" | "details">("position");
  const vaultData = useVaultData();

  return (
    <>
      <div className="flex items-center flex-col grow pt-6">
        <div className="px-4 w-full max-w-7xl">
          <VaultHeader vaultName={vaultData.vaultName} />

          <VaultMetrics data={vaultData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

export default VaultDetailPage;
