import { ethers } from "hardhat";

async function main() {
  const GaslessForwarder = await ethers.getContractFactory("GaslessForwarder");
  const forwarder = await GaslessForwarder.deploy();
  
  console.log(`GaslessForwarder deployed to: ${await forwarder.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});