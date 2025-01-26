import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);

    const GaslessRelayer = await ethers.getContractFactory("GaslessRelayer");
    const relayer = await GaslessRelayer.deploy();
    
    await relayer.waitForDeployment();
    console.log("GaslessRelayer deployed to:", await relayer.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });