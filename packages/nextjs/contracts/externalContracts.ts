import { ethVaultAbi } from "./ethVaultAbi";
import { usdcAbi } from "./usdcAbi";
import { vaultAbi } from "./vaultAbi";
import { wethAbi } from "./wethAbi";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts: GenericContractsDeclaration = {
  1: {
    vault: {
      address: "0x4F2ba48FaF0bA42c4E4b7871d3861418c83aE568",
      abi: vaultAbi,
    },
    usdc: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      abi: usdcAbi,
    },
    ethVault: {
      address: "0x633bdc298c7f663a9000257dc495c30e910351a4",
      abi: ethVaultAbi,
    },
    weth: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      abi: wethAbi,
    },
  },
  137: {
    vault: {
      address: "0xc95961616eCa3DBbabB89dC160Ac67088bC52c90",
      abi: vaultAbi,
    },
    usdc: {
      address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
      abi: usdcAbi,
    },
  },
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
