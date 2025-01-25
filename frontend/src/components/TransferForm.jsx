import { useState } from 'react';
import { ethers } from 'ethers';
import { 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';

const ForwarderABI = [/* Paste ABI from artifacts */];
const FORWARDER_ADDRESS = import.meta.env.VITE_FORWARDER_ADDRESS;

export default function TransferForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isERC721, setIsERC721] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const forwarder = new ethers.Contract(
      FORWARDER_ADDRESS,
      ForwarderABI,
      signer
    );

    // Generate transaction data
    const iface = new ethers.Interface([
      isERC721 ? 
        "function safeTransferFrom(address,address,uint256)" :
        "function transferFrom(address,address,uint256)"
    ]);
    
    const data = iface.encodeFunctionData(
      isERC721 ? "safeTransferFrom" : "transferFrom",
      [await signer.getAddress(), recipient, amount]
    );

    // Sign and send
    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "address", "bytes", "uint256", "uint256"],
      [await signer.getAddress(), tokenAddress, data, await forwarder.nonces(await signer.getAddress()), 11155111]
    );
    
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    
    const tx = await forwarder.execute(
      await signer.getAddress(),
      tokenAddress,
      data,
      signature
    );

    await tx.wait();
    alert(`Transaction mined: ${tx.hash}`);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Gasless Transfer
      </Typography>
      
      <TextField
        fullWidth
        label="Token Address"
        variant="outlined"
        margin="normal"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />
      
      <TextField
        fullWidth
        label="Recipient Address"
        variant="outlined"
        margin="normal"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      
      <TextField
        fullWidth
        label={isERC721 ? "Token ID" : "Amount"}
        variant="outlined"
        margin="normal"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      
      <FormControlLabel
        control={<Switch checked={isERC721} onChange={(e) => setIsERC721(e.target.checked)} />}
        label="ERC-721 Transfer"
        sx={{ my: 2 }}
      />
      
      <Button 
        type="submit" 
        variant="contained" 
        size="large" 
        fullWidth
      >
        Send Gasless Transaction
      </Button>
    </Box>
  );
}