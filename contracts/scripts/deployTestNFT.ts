// scripts/deployTestNFT.ts
import { ethers } from "hardhat";
import type { TestNFT } from "../typechain-types";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const TestNFT = await ethers.getContractFactory("TestNFT");
  const nft = await TestNFT.deploy() as unknown as TestNFT;

  // Option 1: Use mintSome() to create 5 tokens
  console.log("Minting batch of 5 tokens...");
  const tx = await nft.mintSome();
  await tx.wait();
  
  // Option 2: Mint specific token IDs
  // const tokenIds = [1, 2, 3, 4, 5];
  // for (const tokenId of tokenIds) {
  //   await nft.mint(deployer.address, tokenId);
  // }

  console.log(`\nTestNFT deployed to: ${await nft.getAddress()}`);
  console.log(`Tokens minted to: ${deployer.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});