import { useState } from "react";
import { parseUnits } from "viem";
import { useAccount, usePublicClient, useSignTypedData, useWalletClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function usePermitDeposit() {
  const { address: connectedAddress, chain } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const { signTypedDataAsync } = useSignTypedData();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const { data: vaultContractInfo } = useDeployedContractInfo("vault");
  const vaultAddress = vaultContractInfo?.address;

  const { data: usdcContractInfo } = useDeployedContractInfo("usdc");
  const usdcAddress = usdcContractInfo?.address;

  const { data: nonce } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "nonces",
    args: [connectedAddress],
  });

  const { data: usdcName } = useScaffoldReadContract({
    contractName: "usdc",
    functionName: "name",
  });

  const { writeContractAsync: writeUsdcAsync } = useScaffoldWriteContract({ contractName: "usdc" });
  const { writeContractAsync: writeVaultAsync } = useScaffoldWriteContract({ contractName: "vault" });

  const permitDeposit = async (
    depositAmount: string,
    assetDecimals: number,
    isMaxDeposit: boolean,
    usdcBalance?: bigint,
  ) => {
    if (
      !connectedAddress ||
      !vaultAddress ||
      !usdcAddress ||
      !chain ||
      nonce === undefined ||
      !publicClient ||
      !walletClient
    ) {
      throw new Error("Missing required data for permit");
    }

    setIsProcessing(true);

    try {
      let amount: bigint;
      if (isMaxDeposit && usdcBalance) {
        amount = usdcBalance;
      } else {
        amount = parseUnits(depositAmount, assetDecimals);
      }

      // Set deadline to 1 hour from now
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);

      // EIP-2612 Permit domain and types
      const domain = {
        name: usdcName || "USD Coin",
        version: "2",
        chainId: chain.id,
        verifyingContract: usdcAddress as `0x${string}`,
      };

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const message = {
        owner: connectedAddress,
        spender: vaultAddress,
        value: amount,
        nonce: nonce,
        deadline: deadline,
      };

      // Request signature from user
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: "Permit",
        message,
      });

      // Split signature into v, r, s
      const r = `0x${signature.slice(2, 66)}` as `0x${string}`;
      const s = `0x${signature.slice(66, 130)}` as `0x${string}`;
      const v = parseInt(signature.slice(130, 132), 16);

      // Execute permit transaction
      const permitHash = await writeUsdcAsync({
        functionName: "permit",
        args: [connectedAddress, vaultAddress, amount, deadline, v, r, s],
      });

      if (!permitHash) {
        throw new Error("Permit transaction failed");
      }

      // Wait for permit transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash: permitHash });

      // Execute deposit transaction
      await writeVaultAsync({
        functionName: "deposit",
        args: [amount, connectedAddress],
      });

      setIsProcessing(false);
      return true;
    } catch (error) {
      console.error("Error in permit deposit:", error);
      setIsProcessing(false);
      throw error;
    }
  };

  return {
    permitDeposit,
    isProcessing,
  };
}
