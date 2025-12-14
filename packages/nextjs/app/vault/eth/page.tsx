"use client";

import { EthVaultActions, EthVaultHeader, EthVaultMetrics, EthVaultPosition } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useEthVaultData } from "~~/hooks/sovabase/useEthVaultData";

const EthVaultPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const vaultData = useEthVaultData();

  return (
    <>
      <div className="flex items-center flex-col grow pt-6">
        <div className="px-4 w-full max-w-7xl">
          <EthVaultHeader vaultName={vaultData.vaultName} />

          <EthVaultMetrics data={vaultData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            <div className="lg:col-span-2">
              <EthVaultPosition connectedAddress={connectedAddress} data={vaultData} />
            </div>

            <EthVaultActions data={vaultData} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EthVaultPage;
