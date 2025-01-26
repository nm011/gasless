"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/deployTestNFT.ts
const hardhat_1 = require("hardhat");
async function main() {
    const [deployer] = await hardhat_1.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const TestNFT = await hardhat_1.ethers.getContractFactory("TestNFT");
    const nft = await TestNFT.deploy();
    // Mint Token ID 1 to yourself
    await nft.mint(deployer.address, 1);
    console.log(`TestNFT deployed to: ${await nft.getAddress()}`);
    console.log(`Token 1 minted to: ${deployer.address}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
