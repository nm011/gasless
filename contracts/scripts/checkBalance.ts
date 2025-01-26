import { ethers } from "hardhat";

async function main() {
//   const address = "0xC93B2170602fAdDDd81df5a1AdE06C24194230c2"; // Replace with any address
  const address = "0xf7cD81C87d14d2AefeD2b912a912ef08c7F03E46"; // Replace with any address
  
  const balance = await ethers.provider.getBalance(address);
  console.log(`Balance of ${address}: ${ethers.formatEther(balance)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});