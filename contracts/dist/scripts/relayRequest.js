"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
// import { main as signRequest } from "./signRequest";
async function main() {
    // Get signed data from signRequest
    const signRequest = require("./signRequest");
    const { request, signature } = await signRequest();
    const CONTRACT_ADDRESS = "0xf7cD81C87d14d2AefeD2b912a912ef08c7F03E46";
    const contract = await hardhat_1.ethers.getContractAt("GaslessForwarder", CONTRACT_ADDRESS);
    const tx = await contract.relay(request, signature);
    await tx.wait();
    console.log("Transaction hash:", tx.hash);
    const contractBalance = await hardhat_1.ethers.provider.getBalance(CONTRACT_ADDRESS);
    console.log("Contract balance after:", hardhat_1.ethers.formatEther(contractBalance));
    // Fixed address retrieval
    const signerAddress = await (await hardhat_1.ethers.provider.getSigner()).getAddress();
    const yourBalance = await hardhat_1.ethers.provider.getBalance(signerAddress);
    console.log("Your balance after:", hardhat_1.ethers.formatEther(yourBalance));
}
module.exports = main;
main().catch(console.error);
