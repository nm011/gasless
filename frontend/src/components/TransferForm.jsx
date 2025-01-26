import { useState, useContext } from 'react';
import { ethers } from 'ethers';
import { 
  TextField, 
  Button, 
  Switch, 
  FormControlLabel,
  Box,
  Typography
} from '@mui/material';
import { WalletContext } from '../contexts/WalletContext';
import ConnectButton from './ConnectButton';
import RelayerABI from '../abis/GaslessRelayer.json';

const RELAYER_URL = import.meta.env.VITE_RELAYER_URL;
console.log("Relayer URL:", import.meta.env.VITE_RELAYER_URL);

export default function TransferForm() {
  const { account } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    recipient: '',
    amount: '',
    isERC721: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Validate inputs
      if (!ethers.isAddress(formData.tokenAddress)) 
        throw new Error("Invalid token address");
      if (!ethers.isAddress(formData.recipient)) 
        throw new Error("Invalid recipient address");
  
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
  
      // Initialize NFT contract
      const nftContract = new ethers.Contract(
        formData.tokenAddress,
        [
          "function getApproved(uint256) view returns (address)",
          "function approve(address,uint256)",
          "function ownerOf(uint256) view returns (address)"
        ],
        signer
      );
  
      // // Check token ownership
      // const owner = await nftContract.ownerOf(formData.amount);
      // if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      //   throw new Error("You do not own this token");
      // }
  
      // Check and set approval
      const currentApproved = await nftContract.getApproved(formData.amount);
      if (currentApproved.toLowerCase() !== import.meta.env.VITE_RELAYER_ADDRESS.toLowerCase()) {
        const approveTx = await nftContract.approve(import.meta.env.VITE_RELAYER_ADDRESS, formData.amount);
        await approveTx.wait();
        console.log("Approval successful");
      }
  
      // Rest of your gasless transaction logic...
      const relayerContract = new ethers.Contract(
        import.meta.env.VITE_RELAYER_ADDRESS,
        RelayerABI.abi,
        signer
      );
  
      const iface = new ethers.Interface([
        "function safeTransferFrom(address,address,uint256)"
      ]);
  
      const data = iface.encodeFunctionData(
        "safeTransferFrom",
        [userAddress, formData.recipient, formData.amount]
      );
  
      const nonce = await relayerContract.nonces(userAddress);
      const deadline = Math.floor(Date.now() / 1000) + 1800;
  
      const request = {
        user: userAddress,
        target: formData.tokenAddress,
        data: data,
        nonce: nonce.toString(),
        deadline: deadline.toString()
      };
  
      const signature = await signer.signTypedData(
        {
          name: "GaslessRelayer",
          version: "1",
          chainId: (await provider.getNetwork()).chainId,
          verifyingContract: import.meta.env.VITE_RELAYER_ADDRESS
        },
        {
          ForwardRequest: [
            { name: "user", type: "address" },
            { name: "target", type: "address" },
            { name: "data", type: "bytes" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
          ]
        },
        request
      );
  
      const response = await fetch(import.meta.env.VITE_RELAYER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request, signature })
      });
  
      if (!response.ok) throw new Error('Relaying failed');
      
      const { txHash } = await response.json();
      alert(`Transaction successful: ${txHash}`);
      setFormData({ tokenAddress: '', recipient: '', amount: '', isERC721: false });
  
    } catch (error) {
      console.error("Transfer failed:", error);
      alert(`Error: ${error.reason || error.message}`);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchChange = (e) => {
    setFormData({
      ...formData,
      isERC721: e.target.checked
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <ConnectButton />
      
      {account && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
            Gasless Transfer
          </Typography>
          
          <TextField
            fullWidth
            label="Token Address"
            name="tokenAddress"
            variant="outlined"
            margin="normal"
            value={formData.tokenAddress}
            onChange={handleInputChange}
            placeholder="0x..."
          />
          
          <TextField
            fullWidth
            label="Recipient Address"
            name="recipient"
            variant="outlined"
            margin="normal"
            value={formData.recipient}
            onChange={handleInputChange}
            placeholder="0x..."
          />
          
          <TextField
            fullWidth
            label={formData.isERC721 ? "Token ID" : "Amount"}
            name="amount"
            variant="outlined"
            margin="normal"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder={formData.isERC721 ? "123" : "1.0"}
          />
          
          <FormControlLabel
            control={<Switch 
              checked={formData.isERC721} 
              onChange={handleSwitchChange} 
            />}
            label="ERC-721 Transfer"
            sx={{ my: 2 }}
          />
          
          <Button 
            type="submit" 
            variant="contained" 
            size="large" 
            fullWidth
            sx={{ mt: 2 }}
          >
            Send Gasless Transaction
          </Button>
        </>
      )}
    </Box>
  );
}