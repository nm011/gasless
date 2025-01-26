// server.js
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();
const RelayerABI = require('../frontend/src/abis/GaslessRelayer.json');

const app = express();

// Validate environment variables on startup
const validateEnv = () => {
  if (!process.env.RELAYER_ADDRESS) {
    throw new Error('RELAYER_ADDRESS is not defined in .env');
  }
  if (!process.env.RELAYER_PK) {
    throw new Error('RELAYER_PK is not defined in .env');
  }
  if (!process.env.PROVIDER_URL) {
    throw new Error('PROVIDER_URL is not defined in .env');
  }
};

// Configuration middleware
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize provider and wallet once
const provider = new ethers.JsonRpcProvider(process.env.PROVIDER_URL);
const wallet = new ethers.Wallet(process.env.RELAYER_PK, provider);
const relayerContract = new ethers.Contract(
  process.env.RELAYER_ADDRESS,
  RelayerABI.abi,
  wallet
);

// Verify contract connection
const verifyContract = async () => {
  try {
    const code = await provider.getCode(process.env.RELAYER_ADDRESS);
    if (code === '0x') {
      throw new Error('Contract not deployed at specified address');
    }
    console.log('✅ Verified contract deployment');
  } catch (error) {
    console.error('❌ Contract verification failed:', error.message);
    process.exit(1);
  }
};

// Relayer endpoint
app.post('/relay', async (req, res) => {
    try {
      const { request: rawRequest, signature } = req.body;
      
      // [1] Log incoming request
      console.log('\n=== INCOMING REQUEST ===');
      console.log('Raw Request:', JSON.stringify(rawRequest, (_, v) => 
        typeof v === 'bigint' ? v.toString() : v
      ));
      console.log('Signature:', signature);
  
      // [2] Validate and convert numeric fields
      if (isNaN(rawRequest.nonce) || isNaN(rawRequest.deadline)) {
        console.error('Invalid nonce/deadline format');
        return res.status(400).json({ 
          error: 'Invalid nonce or deadline format' 
        });
      }
  
      const request = {
            ...rawRequest,
            nonce: BigInt(rawRequest.nonce),
            deadline: BigInt(rawRequest.deadline)
        };
        
        // Convert stringified values back to BigInt
        request.nonce = BigInt(request.nonce);
        request.deadline = BigInt(request.deadline);

      // [3] Log converted values
      console.log('\n=== PROCESSED REQUEST ===');
      console.log('User:', request.user);
      console.log('Target:', request.target);
      console.log('Nonce:', request.nonce.toString());
      console.log('Deadline:', request.deadline.toString());
      console.log('Data:', request.data);
  
      // [4] Decode transaction data
      try {
        const iface = new ethers.Interface([
          "function transferFrom(address,address,uint256)",
          "function safeTransferFrom(address,address,uint256)"
        ]);
        const decoded = iface.parseTransaction({ data: request.data });
        console.log('\n=== DECODED CALL DATA ===');
        console.log('Function:', decoded.name);
        console.log('Args:', decoded.args);
      } catch (decodeError) {
        console.error('Data decoding failed:', decodeError);
      }
  
      // [5] Check contract state
      console.log('\n=== CONTRACT STATE ===');
      const currentNonce = await relayerContract.nonces(request.user);
      console.log('Current nonce:', currentNonce.toString());
      console.log('Request nonce:', request.nonce.toString());
      
      const currentTime = Math.floor(Date.now() / 1000);
      console.log('Current timestamp:', currentTime);
      console.log('Deadline:', request.deadline.toString());
  
      // [7] Estimate gas with debug
      console.log('\n=== GAS ESTIMATION ===');
      let gasEstimate;
      try {
        gasEstimate = await relayerContract.execute.estimateGas(request, signature);
        console.log('Gas estimate:', gasEstimate.toString());
      } catch (estimationError) {
        console.error('Gas estimation failed:', {
          message: estimationError.message,
          data: estimationError.data,
          reason: estimationError.reason
        });
        throw estimationError;
      }
  
      // [8] Execute transaction
      console.log('\n=== TRANSACTION EXECUTION ===');
      const tx = await relayerContract.execute(request, signature, {
        gasLimit: gasEstimate * 130n / 100n
      });
      console.log('Tx hash:', tx.hash);
  
      const receipt = await tx.wait();
      console.log('Block confirmed:', receipt.blockNumber);
  
      res.json({
        txHash: receipt.hash,
        gasUsed: receipt.gasUsed.toString(),
        block: receipt.blockNumber
      });
  
    } catch (error) {
      console.error('\n=== ERROR DETAILS ===');
      console.error('Full error:', {
        message: error.message,
        code: error.code,
        data: error.data,
        reason: error.reason,
        stack: error.stack
      });
      
      res.status(500).json({
        error: error.shortMessage || error.message,
        ...(process.env.NODE_ENV === 'development' && {
          details: error.reason,
          stack: error.stack
        })
      });
    }
  });

// Startup sequence
const startServer = async () => {
  try {
    validateEnv();
    await verifyContract();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`\n🚀 Server ready on port ${PORT}`);
      console.log(`📄 Contract: ${process.env.RELAYER_ADDRESS}`);
      console.log(`👛 Relayer: ${wallet.address}`);
      console.log(`⛽ Provider: ${process.env.PROVIDER_URL}\n`);
    });

  } catch (error) {
    console.error('⛔ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();