// scripts/checkSepoliaUSDC.ts
import { ethers } from "hardhat";

async function main() {
  // Use Hardhat's configured provider
  const provider = ethers.provider;
  
  // USDC contract address on Sepolia
  const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  const USER_ADDRESS = "0xYourWalletAddressHere"; // Replace with your address

  // USDC ABI (simplified)
  const usdcAbi = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  try {
    // Create contract instance
    const usdc = await ethers.getContractAt(usdcAbi, USDC_ADDRESS);
    
    // Get balance and decimals
    const balance = await usdc.balanceOf(USER_ADDRESS);
    const decimals = await usdc.decimals();
    
    // Format balance
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    console.log(`\n💰 USDC Balance on Sepolia: ${formattedBalance} USDC`);
  } catch (error) {
    console.error("\n🔴 Error checking balance:", error.message);
  }
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exitCode = 1;
});