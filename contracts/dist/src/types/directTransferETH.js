"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hardhat_1 = require("hardhat");
async function main() {
    // Configuration
    const FORWARDER_ADDRESS = "0x013d52B532bBe020266C1451173b54748Db4a82f";
    const RECIPIENT = "0x609e15708aAb29052821a458F61fAa806Fe6C1E8";
    const ETH_AMOUNT = hardhat_1.ethers.parseEther("0.1");
    const [signer] = await hardhat_1.ethers.getSigners();
    const forwarder = await hardhat_1.ethers.getContractAt("GaslessForwarder", FORWARDER_ADDRESS);
    // Build request
    const request = {
        user: signer.address,
        target: RECIPIENT, // Direct ETH recipient
        data: "0x", // Empty data = ETH transfer
        nonce: await forwarder.nonces(signer.address),
        deadline: Math.floor(Date.now() / 1000) + 300
    };
    // Sign request
    const signature = await signer.signTypedData({
        name: "GaslessForwarder",
        version: "1",
        chainId: (await hardhat_1.ethers.provider.getNetwork()).chainId,
        verifyingContract: FORWARDER_ADDRESS
    }, {
        ForwardRequest: [
            { name: "user", type: "address" },
            { name: "target", type: "address" },
            { name: "data", type: "bytes" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    }, request);
    // Execute through forwarder
    const tx = await forwarder.execute(request, signature);
    console.log(`Transfer TX: ${tx.hash}`);
    await tx.wait();
    console.log("Transfer complete");
}
main().catch(console.error);
