const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();
const RelayerABI = require('../frontend/src/abis/GaslessRelayer.json');

const app = express();

const validateEnv = () => {
  const required = ['RELAYER_ADDRESS', 'RELAYER_PK', 'PROVIDER_URL'];
  required.forEach(env => {
    if (!process.env[env]) throw new Error(`${env} is not defined in .env`);
  });
};

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// initialize provider and wallet once
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider);
const relayerContract = new ethers.Contract(
  process.env.RELAYER_ADDRESS,
  RelayerABI.abi,
  wallet
);

const erc20Interface = new ethers.Interface([
  "function permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",
  "function transferFrom(address,address,uint256) returns (bool)"
]);

const erc721Interface = new ethers.Interface([
  "function permit(address,uint256,uint256,bytes)",
  "function safeTransferFrom(address,address,uint256)"
]);

const decodeCall = (data) => {
  try {
    return erc20Interface.parseTransaction({ data }) || 
           erc721Interface.parseTransaction({ data });
  } catch {
    return null;
  }
};

// verify contract connection
const verifyContract = async () => {
  const code = await provider.getCode(process.env.RELAYER_ADDRESS);
  if (code === '0x') throw new Error('Contract not deployed');
  console.log('✅ Verified contract deployment');
};

app.post('/relay', async (req, res) => {
  try {
    const { request: rawRequest, signature } = req.body;

    console.log(signature);
    
    const request = {
      ...rawRequest,
      nonce: BigInt(rawRequest.nonce),
      deadline: BigInt(rawRequest.deadline)
    };

    // decode batched calls
    const calls = ethers.AbiCoder.defaultAbiCoder().decode(
      ['bytes[]'], 
      request.data
    )[0];

    console.log('\n=== DECODED TRANSACTION ===');
    console.log(`User: ${request.user}`);
    console.log(`Target: ${request.target}`);
    console.log(`Calls (${calls.length}):`);

    calls.forEach((callData, i) => {
      const decoded = decodeCall(callData);
      console.log(`[${i}] ${decoded?.name || 'Unknown'}`);
      if (decoded) console.log(`    Args: ${decoded.args.join(', ')}`);
    });

    const [currentNonce, currentTime] = await Promise.all([
      relayerContract.nonces(request.user),
      provider.getBlock('latest').then(b => b.timestamp)
    ]);

    console.log('\n=== VALIDATION ===');
    // console.log(`Nonce: ${request.nonce} (Current: ${currentNonce})`);
    console.log(`Nonce Validation:
    - Received: ${request.nonce.toString()}
    - Expected: ${currentNonce.toString()}
    - Difference: ${request.nonce - currentNonce}`);
    console.log(`Deadline: ${request.deadline} (Current: ${currentTime})`);

    if (request.nonce !== currentNonce) {
      throw new Error(`Invalid nonce (expected ${currentNonce})`);
    }

    if (request.deadline <= currentTime) {
      throw new Error('Transaction expired');
    }

    // execute transaction
    console.log('\n=== EXECUTION ===');
    const gasEstimate = await relayerContract.execute.estimateGas(
      request, 
      signature
    );

    const tx = await relayerContract.execute(request, signature, {
      gasLimit: gasEstimate * 2n // Double gas for batch safety
      // gasLimit: 6755000
    });

    console.log(`Tx submitted: ${tx.hash}`);
    const receipt = await tx.wait();
    
    res.json({
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
      block: receipt.blockNumber
    });

  } catch (error) {
    console.error('Relay Error:', error);
    res.status(500).json({
      error: error.reason || error.message,
      ...(process.env.NODE_ENV === 'development' && {
        details: error.info?.error?.data || error.data
      })
    });
  }
});

const startServer = async () => {
  try {
    validateEnv();
    await verifyContract();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`
      🚀 Server ready on port ${PORT}
      📄 Contract: ${process.env.RELAYER_ADDRESS}
      👛 Relayer: ${wallet.address}
      ⛽ Provider: ${process.env.PROVIDER_URL}
      `);
    });

  } catch (error) {
    console.error('⛔ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
