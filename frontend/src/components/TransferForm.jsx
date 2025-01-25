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


// Import ABI from Hardhat artifacts (create this file first)
import ForwarderABI from '../abis/GaslessForwarder.json';

// Load environment variables
const FORWARDER_ADDRESS = import.meta.env.VITE_FORWARDER_ADDRESS;

export default function TransferForm() {
  const { account } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    recipient: '',
    amount: '',
    isERC721: false
  });

  // Updated handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
        
        // Basic validation
        if (!ethers.isAddress(formData.tokenAddress)) 
            throw new Error("Invalid token address");
        if (!ethers.isAddress(formData.recipient)) 
            throw new Error("Invalid recipient address");
    
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const forwarderContract = new ethers.Contract(
            FORWARDER_ADDRESS,
            ForwarderABI.abi,
            signer
            );
        
        // 1. Handle ERC-721 Approval FIRST
        if (formData.isERC721) {
            const nftContract = new ethers.Contract(
            formData.tokenAddress,
            [
                "function getApproved(uint256) view returns (address)",
                "function approve(address,uint256)"
            ],
            signer
            );
    
            // Check existing approval
            const currentApproval = await nftContract.getApproved(formData.amount);
            if (currentApproval !== FORWARDER_ADDRESS) {
            const approveTx = await nftContract.approve(
                FORWARDER_ADDRESS, 
                formData.amount
            );
            await approveTx.wait();
            }
        }
    
        // 2. Prepare Transaction Data
        const iface = new ethers.Interface([
            formData.isERC721 ? 
            "function safeTransferFrom(address,address,uint256)" : 
            "function transferFrom(address,address,uint256)"
        ]);
    
        const data = iface.encodeFunctionData(
            formData.isERC721 ? "safeTransferFrom" : "transferFrom",
            [await signer.getAddress(), formData.recipient, formData.amount]
        );
    
        // 3. Build EIP-712 Request
        const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes
        const nonce = await forwarderContract.nonces(await signer.getAddress());
        
        const request = {
            user: await signer.getAddress(),
            target: formData.tokenAddress,
            data: data,
            nonce: nonce,
            deadline: deadline
        };
    
        // 4. Sign Typed Data
        const signature = await signer.signTypedData(
            {
            name: "GaslessForwarder",
            version: "1",
            chainId: (await provider.getNetwork()).chainId,
            verifyingContract: FORWARDER_ADDRESS
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
    
        // 5. Execute Gasless Transaction    
        const tx = await forwarderContract.execute(request, signature);

        await tx.wait();
        
        alert(`Transaction successful: ${tx.hash}`);
        setFormData({...formData, amount: '', tokenAddress: '', recipient: ''});
    
        } catch (error) {
        console.error("Transfer failed:", error);
        alert(`Error: ${error.reason || error.message}`);
        }
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
            variant="outlined"
            margin="normal"
            value={formData.tokenAddress}
            onChange={(e) => setFormData({...formData, tokenAddress: e.target.value})}
            placeholder="0x7b79995e5f793A07Bc00c214D6427d9ACeFE8C1A"
          />
          
          <TextField
            fullWidth
            label="Recipient Address"
            variant="outlined"
            margin="normal"
            value={formData.recipient}
            onChange={(e) => setFormData({...formData, recipient: e.target.value})}
            placeholder="0x..."
          />
          
          <TextField
            fullWidth
            label={formData.isERC721 ? "Token ID" : "Amount"}
            variant="outlined"
            margin="normal"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
            placeholder={formData.isERC721 ? "123" : "1.0"}
          />
          
          <FormControlLabel
            control={<Switch 
              checked={formData.isERC721} 
              onChange={(e) => setFormData({...formData, isERC721: e.target.checked})} 
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