# Gasless Transaction Forwarder

Gasless transactions allow users to interact with blockchain applications without needing to hold native tokens for gas fees. This project implements a gasless transaction forwarder

## Installation
   ```bash
   git clone https://github.com/nm011/gasless.git
   cd gasless
   npm install
   ```
   ## Deployment Instructions

Follow these steps to deploy the gasless transaction forwarder:

### Prerequisites

1. Ensure you have the following installed:
   - [Node.js](https://nodejs.org/) (v18 or higher)
   - [Hardhat](https://hardhat.org/)
   - A wallet with sufficient native tokens to cover deployment costs.

2. Set up a blockchain provider (e.g., Infura, Alchemy) to interact with your desired network.

3. Create a `.env` file in the project root directory with the following keys:
   ```plaintext
   PRIVATE_KEY=<your-private-key>
   INFURA_API_KEY=<your-infura-api-key>
   NETWORK=<network-name>
   ```
Replace <your-private-key> with the private key of your wallet.
Replace <your-infura-api-key> with your Infura project key.
Replace <network-name> with the target network (e.g., goerli, mainnet).

## Steps to Deploy

Follow these steps to deploy the gasless transaction forwarder to your desired network:

### 1. Compile Smart Contracts
```bash
npx hardhat compile
```
### 2. Deploy the forwarder contract
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```
### 3. Copy the Deployed Contract Address
### 4. Verify the Contract (Optional)
```bash
npx hardhat verify --network <network-name> <deployed-contract-address>
```
### 5. Notes
Ensure your wallet has sufficient native tokens for gas fees.
You can test the deployment locally by using the localhost network with Hardhat’s built-in blockchain:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network <network-name>
```
