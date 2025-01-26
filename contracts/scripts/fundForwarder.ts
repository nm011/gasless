import { ethers } from "hardhat";

async function main() {
  const [sender] = await ethers.getSigners();
  const recipient = "0xf7cD81C87d14d2AefeD2b912a912ef08c7F03E46";
  const amount = ethers.parseEther("0.1");

  console.log(`Sender balance before: ${ethers.formatEther(await sender.provider!.getBalance(sender.address))} ETH`);
  
  const tx = await sender.sendTransaction({
    to: recipient,
    value: amount
  });

  console.log(`Transaction sent: ${tx.hash}`);
  await tx.wait();
  
  console.log(`Sender balance after: ${ethers.formatEther(await sender.provider!.getBalance(sender.address))} ETH`);
  console.log(`Recipient balance: ${ethers.formatEther(await sender.provider!.getBalance(recipient))} ETH`);
}

main().catch(console.error);