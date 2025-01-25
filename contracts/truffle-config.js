require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

const mnemonic = process.env.MNEMONIC;
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
        privateKeys: [process.env.PRIVATE_KEY],
        providerOrUrl: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      }),
      network_id: 11155111,
      networkCheckTimeout: 30000, // Increase to 30 seconds
      timeoutBlocks: 200,
      from: "0xC93B2170602fAdDDd81df5a1AdE06C24194230c2"
    }
  },
  contracts_directory: "./contracts",
  contracts_build_directory: "./build/contracts",
  migrations_directory: "./migrations",
  compilers: {
    solc: {
      version: "0.8.0", // Must match your pragma
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};

