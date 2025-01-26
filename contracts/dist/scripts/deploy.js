"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    const GaslessForwarder = await hardhat_1.ethers.getContractFactory("GaslessForwarder");
    const forwarder = await GaslessForwarder.deploy();
    console.log(`GaslessForwarder deployed to: ${await forwarder.getAddress()}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
