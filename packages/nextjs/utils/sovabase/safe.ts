import Safe from "@safe-global/protocol-kit";
import { MetaTransactionData } from "@safe-global/safe-core-sdk-types";
import { type Address, type PublicClient, encodeFunctionData } from "viem";

/**
 * Safe wallet utility functions
 * Handles detection and transaction batching for Safe multisig wallets
 */

/**
 * Check if an address is a smart contract wallet
 * @param address - Address to check
 * @param publicClient - Viem public client
 * @returns true if address is a contract
 */
export const isContractWallet = async (address: Address, publicClient: PublicClient): Promise<boolean> => {
  try {
    const code = await publicClient.getBytecode({ address });
    return code !== undefined && code !== "0x";
  } catch {
    return false;
  }
};

/**
 * Create approve transaction data for batching
 */
const createApproveTransaction = (usdcAddress: Address, vaultAddress: Address, amount: bigint): MetaTransactionData => {
  const data = encodeFunctionData({
    abi: [
      {
        name: "approve",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
        ],
        outputs: [{ name: "", type: "bool" }],
      },
    ],
    functionName: "approve",
    args: [vaultAddress, amount],
  });

  return {
    to: usdcAddress,
    data,
    value: "0",
  };
};

/**
 * Create deposit transaction data for batching
 */
const createDepositTransaction = (vaultAddress: Address, amount: bigint, receiver: Address): MetaTransactionData => {
  const data = encodeFunctionData({
    abi: [
      {
        name: "deposit",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "assets", type: "uint256" },
          { name: "receiver", type: "address" },
        ],
        outputs: [{ name: "shares", type: "uint256" }],
      },
    ],
    functionName: "deposit",
    args: [amount, receiver],
  });

  return {
    to: vaultAddress,
    data,
    value: "0",
  };
};

export interface SafeBatchDepositParams {
  safeAddress: Address;
  usdcAddress: Address;
  vaultAddress: Address;
  amount: bigint;
  receiver: Address;
  chainId: number;
}

/**
 * Create a batched Safe transaction for approve + deposit
 * @returns The Safe transaction hash
 */
export const createSafeBatchedDeposit = async (params: SafeBatchDepositParams): Promise<string> => {
  const { safeAddress, usdcAddress, vaultAddress, amount, receiver } = params;

  // Initialize Safe SDK
  const protocolKit = await Safe.init({
    provider: window.ethereum,
    safeAddress,
  });

  // Create batch transactions
  const transactions: MetaTransactionData[] = [
    createApproveTransaction(usdcAddress, vaultAddress, amount),
    createDepositTransaction(vaultAddress, amount, receiver),
  ];

  // Create Safe transaction
  const safeTransaction = await protocolKit.createTransaction({ transactions });

  // Get transaction hash
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);

  // Sign transaction
  await protocolKit.signTransaction(safeTransaction);

  // Propose transaction to Safe (requires Safe Transaction Service)
  // Note: This will open Safe UI for signature collection
  console.log("Safe transaction created:", {
    hash: safeTxHash,
    transactions: transactions.length,
  });

  return safeTxHash;
};
