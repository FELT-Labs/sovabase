# 🦉 Sovabase

**Secure and efficient yield vaults for DeFi**

Sovabase is a decentralized application (dApp) that provides secure yield vaults for digital assets. Built on Ethereum, Sovabase allows users to deposit their assets into vaults to earn yields while maintaining full control and transparency.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript (powered by Scaffold-ETH 2).

## Features

- 💵 **USDC Vault**: Deposit USDC and earn yields through secure, audited strategies
- 💎 **ETH Vault**: Coming soon - stake ETH and earn rewards
- 📊 **Real-time Stats**: View total assets, vault shares, and your personal holdings
- 🔐 **Secure**: Built on battle-tested ERC-4626 vault standard
- 🎨 **Modern UI**: Clean, intuitive interface for managing your vault positions
- 🔗 **Multi-Wallet Support**: Connect with MetaMask, WalletConnect, and more

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Sovabase locally, follow the steps below:

1. **Clone and install dependencies:**

```bash
git clone <your-repo-url>
cd sovabase
yarn install
```

2. **Run a local Ethereum network** (first terminal):

```bash
yarn chain
```

This starts a local Ethereum network using Hardhat for testing and development.

3. **Deploy contracts** (second terminal):

```bash
yarn deploy
```

This deploys the vault contracts to your local network. You can customize deployment scripts in `packages/hardhat/deploy`.

4. **Start the Next.js frontend** (third terminal):

```bash
yarn start
```

Visit the app at `http://localhost:3000` to:
- View available vaults (USDC, ETH coming soon)
- Connect your wallet
- See vault statistics and your holdings
- Access the Debug Contracts page for advanced interactions

## Project Structure

```
sovabase/
├── packages/
│   ├── hardhat/          # Smart contracts and deployment scripts
│   │   ├── contracts/    # Solidity contracts
│   │   ├── deploy/       # Deployment scripts
│   │   └── test/         # Contract tests
│   └── nextjs/           # Frontend application
│       ├── app/          # Next.js pages
│       │   ├── page.tsx  # Main vault dashboard
│       │   └── vault/    # Individual vault pages
│       ├── components/   # React components
│       └── hooks/        # Custom React hooks for contract interaction
```

## Key Files

- **Frontend homepage**: `packages/nextjs/app/page.tsx` - Main vault dashboard
- **Vault detail page**: `packages/nextjs/app/vault/[vaultName]/page.tsx` - Individual vault interface
- **Vault contracts**: Configured in `packages/nextjs/contracts/externalContracts.ts`
- **App configuration**: `packages/nextjs/scaffold.config.ts` - Network settings and app config

## Testing

Run contract tests:
```bash
yarn hardhat:test
```


## Technology Stack

Sovabase is built on top of [Scaffold-ETH 2](https://scaffoldeth.io), leveraging:

- **Smart Contracts**: Solidity, Hardhat
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Web3 Integration**: Wagmi, Viem, RainbowKit
- **Styling**: Tailwind CSS, DaisyUI
- **Vault Standard**: ERC-4626 (Tokenized Vault Standard)

## Development

### Available Scripts

- `yarn chain` - Start local Hardhat network
- `yarn deploy` - Deploy contracts to local network
- `yarn start` - Start Next.js development server
- `yarn compile` - Compile smart contracts
- `yarn test` - Run contract tests
- `yarn hardhat:test` - Run Hardhat tests
- `yarn format` - Format code
- `yarn lint` - Lint code

### Network Configuration

Configure target networks in `packages/nextjs/scaffold.config.ts`. The app supports multiple EVM networks and can easily switch between them.

## Contributing

We welcome contributions to Sovabase! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

Please feel free to open issues and pull requests.

## Resources

- [Scaffold-ETH 2 Documentation](https://docs.scaffoldeth.io)
- [ERC-4626 Standard](https://eips.ethereum.org/EIPS/eip-4626)
- [Next.js Documentation](https://nextjs.org/docs)
