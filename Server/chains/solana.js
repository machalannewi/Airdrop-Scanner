import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();
const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// Validate Solana address
const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Generic Helius RPC call
const heliusRPC = async (method, params) => {
  const response = await axios.post(
    `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
    { jsonrpc: "2.0", id: "1", method, params }
  );
  return response.data.result;
};

export { isValidSolanaAddress, heliusRPC };