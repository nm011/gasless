import { ethers } from "hardhat";

async function main() {
  const TestNFT = await ethers.getContractFactory("TestNFT");
  const nft = await TestNFT.deploy();
  console.log(`TestNFT deployed to: ${await nft.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
