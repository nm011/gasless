"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// signRequest.ts
const hardhat_1 = require("hardhat");
async function main() {
    // Replace these values
    const CONTRACT_ADDRESS = "0xf7cD81C87d14d2AefeD2b912a912ef08c7F03E46";
    const USER_ADDRESS = "0xC93B2170602fAdDDd81df5a1AdE06C24194230c2";
    const PRIVATE_KEY = "f085ac494cba4a09e6f4bd04f3c4be2e931eb244048ba9d191a407f3f6406ec4";
    // Get current nonce using correct method
    const nonce = await hardhat_1.ethers.provider.getStorage(CONTRACT_ADDRESS, hardhat_1.ethers.keccak256(hardhat_1.ethers.AbiCoder.defaultAbiCoder().encode(["address", "uint256"], [USER_ADDRESS, 0])));
    const request = {
        user: USER_ADDRESS,
        target: hardhat_1.ethers.ZeroAddress,
        data: "0x",
        nonce: parseInt(nonce, 16),
        deadline: Math.floor(Date.now() / 1000) + 3600,
        fee: hardhat_1.ethers.parseEther("0.1")
    };
    // Use Wallet for signing
    const wallet = new hardhat_1.ethers.Wallet(PRIVATE_KEY, hardhat_1.ethers.provider);
    const signature = await wallet.signTypedData({
        name: "GaslessForwarder",
        version: "1",
        chainId: await hardhat_1.ethers.provider.getNetwork().then(n => n.chainId),
        verifyingContract: CONTRACT_ADDRESS
    }, {
        ForwardRequest: [
            { name: "user", type: "address" },
            { name: "target", type: "address" },
            { name: "data", type: "bytes" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
            { name: "fee", type: "uint256" }
        ]
    }, request);
    console.log("Request:", request);
    console.log("Signature:", signature);
    return { request, signature };
}
module.exports = main;
main().catch(console.error);
