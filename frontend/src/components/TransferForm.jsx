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

const ERC20_ABI = [
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint)",
  "function transferFrom(address, address, uint256) returns (bool)",
  "function nonces(address) view returns (uint256)",
  "function permit(address,address,uint256,uint256,uint8,bytes32,bytes32)"
];

const ERC721_ABI = [
  "function name() view returns (string)",
  "function ownerOf(uint256) view returns (address)",
  "function safeTransferFrom(address, address, uint256)",
  "function nonces(uint256) view returns (uint256)",
  "function permit(address,uint256,uint256,bytes)"
];

const TransferForm = () => {
  const { account } = useContext(WalletContext);
  const [formData, setFormData] = useState({
    tokenAddress: '',
    recipient: '',
    amount: '',
    isERC721: false
  });

  const splitSignature = (signature) => {
    const sig = ethers.Signature.from(signature);
    return { v: sig.v, r: sig.r, s: sig.s };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      let permitData, transferData;

      if (formData.isERC721) {
        const tokenContract = new ethers.Contract(
          formData.tokenAddress,
          ERC721_ABI,
          signer
        );

        const tokenId = formData.amount;
        const deadline = Math.floor(Date.now() / 1000) + 1800;

        let tokenName;
        try {
          tokenName = await tokenContract.name();
        } catch {
          tokenName = "ERC721 Token";
        }

        const nonce = await tokenContract.nonces(tokenId);
        

        const domain = {
          name: tokenName,
          version: "1",
          chainId: (await provider.getNetwork()).chainId,
          verifyingContract: formData.tokenAddress
        };

        const types = {
          Permit: [
            { name: "spender", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
          ]
        };

        const permitSignature = await signer.signTypedData(domain, types, {
          spender: import.meta.env.VITE_RELAYER_ADDRESS,
          tokenId,
          nonce,
          deadline
        });

        // encode calls
        permitData = tokenContract.interface.encodeFunctionData("permit", [
          import.meta.env.VITE_RELAYER_ADDRESS,
          tokenId,
          deadline,
          permitSignature
        ]);

        transferData = tokenContract.interface.encodeFunctionData("safeTransferFrom", [
          userAddress,
          formData.recipient,
          tokenId
        ]);

      } else {
        // ERC-20 Transfer with Permit
        const tokenContract = new ethers.Contract(
          formData.tokenAddress,
          ERC20_ABI,
          signer
        );

        try {
          await tokenContract.nonces(userAddress);
        } catch {
          throw new Error("Token does not support permit functionality");
        }

        const decimals = await tokenContract.decimals();
        const amount = ethers.parseUnits(formData.amount, decimals);
        const nonce = await tokenContract.nonces(userAddress);
        const deadline = Math.floor(Date.now() / 1000) + 1800;

        console.log("Amount = ", amount);
        console.log("tokenContract.name() = ", tokenContract.name());
        const domain = {
          name: await tokenContract.name(),
          version: "2",
          chainId: (await provider.getNetwork()).chainId,
          verifyingContract: formData.tokenAddress
        };

        // permit types
        const types = {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
          ]
        };
        // const types = {
        //   Permit: [
        //     { name: "holder", type: "address" },
        //     { name: "spender", type: "address" },
        //     { name: "nonce", type: "uint256" },
        //     { name: "expiry", type: "uint256" },
        //     { name: "allowed", type: "bool" }
        //   ]
        // };

        const permitSignature = await signer.signTypedData(domain, types, {
          owner: userAddress,
          spender: import.meta.env.VITE_RELAYER_ADDRESS,
          value: amount,
          nonce,
          deadline
        });
        // const permitSignature = {
        //   holder: userAddress,
        //   spender: import.meta.env.VITE_RELAYER_ADDRESS,
        //   nonce,
        //   expiry: deadline,
        //   allowed: true
        // };

        // split signature
        const { v, r, s } = splitSignature(permitSignature);

        console.log("v = ", v, "\n r = ", r, "\n s = ", s)

        permitData = tokenContract.interface.encodeFunctionData("permit", [
          userAddress,
          import.meta.env.VITE_RELAYER_ADDRESS,
          amount,
          deadline,
          v,
          r,
          s
        ]);

        // permitData = tokenContract.interface.encodeFunctionData("permit", [
        //   userAddress,
        //   import.meta.env.VITE_RELAYER_ADDRESS,
        //   nonce,
        //   deadline,
        //   true,  // allowed
        //   v,
        //   r,
        //   s
        // ]);
        

        transferData = tokenContract.interface.encodeFunctionData("transferFrom", [
          userAddress,
          formData.recipient,
          amount
        ]);
      }

      const calls = [permitData, transferData];
      const encodedData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes[]"],
        [calls]
      );

      const relayerContract = new ethers.Contract(
        import.meta.env.VITE_RELAYER_ADDRESS,
        RelayerABI.abi,
        signer
      );

      // const nonce = await relayerContract.nonces(userAddress);
      const nonce = await relayerContract.nonces(userAddress);
      console.log('Current on-chain nonce:', nonce.toString());
      const deadline = Math.floor(Date.now() / 1000) + 1800;

      const request = {
        user: userAddress,
        target: formData.tokenAddress,
        data: encodedData,
        nonce: nonce.toString(),
        deadline: deadline.toString()
      };

      // sign forward request
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

      // relay transaction
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
};

export default TransferForm;
