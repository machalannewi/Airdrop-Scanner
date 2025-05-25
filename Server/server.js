import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isValidSolanaAddress, heliusRPC } from './chains/solana.js';
import { checkAllEthereumAirdrops } from './chains/ethereum.js';





dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors(
    {
        origin: 'https://airdrop-scanner.vercel.app/',
        methods: ['POST', 'GET'],
        credentials: true,
    }
));
app.use(express.json()); 


  app.post('/api/check-sol', async (req, res) => {
    const { walletAddress, selectedChain } = req.body;
  
    if (selectedChain !== 'solana') {
      return res.json([]);
    }
  
    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid Solana address" });
    }
  
    try {
      const jitoTokens = await heliusRPC("getTokenAccountsByOwner", [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed", filters: [
          { memcmp: { offset: 0, bytes: process.env.JITO_MINT_ADDRESS } }
        ]}
      ]).catch(() => ({ value: [] }));
  

      const tensorTxs = await heliusRPC("getSignaturesForAddress", [
        walletAddress,
        {
          limit: 100,
          until: "2024-03-31T00:00:00Z",
          filters: [{ programId: "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6" }]
        }
      ]).catch(() => []);
  
 
      const marginFiTxs = await heliusRPC("getProgramAccounts", [
        "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA",
        {
          encoding: "jsonParsed",
          filters: [{ memcmp: { offset: 8, bytes: walletAddress } }]
        }
      ]).catch(() => []);
  

      const kaminoData = await heliusRPC("getTokenAccountsByOwner", [
        walletAddress,
        { programId: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS" },
        { filters: [{ dataSize: 324 }]}
      ]).catch(() => []);
  

      const parclTxs = await heliusRPC("getSignaturesForAddress", [
        "4LLbsb5ReP3yEtYzmXewyGjcir5uXtKFURtaEUVC2AHs",
        { limit: 10, filters: [{ memcmp: { offset: 32, bytes: walletAddress } }] }
      ]).catch(() => []);
  
  
      const driftTxs = await heliusRPC("getSignaturesForAddress", [
        "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7",
        { limit: 10, filters: [{ memcmp: { offset: 8, bytes: walletAddress } }] }
      ]).catch(() => []);
  

      const results = [
        {
          name: "Jito Airdrop",
          eligible: (jitoTokens?.value || []).length > 0,
          link: "https://jito.network"
        },
        {
          name: "Tensor Airdrop",
          eligible: (tensorTxs || []).length >= 3,
          link: "https://tensor.trade"
        },
        {
          name: "MarginFi Airdrop",
          eligible: (marginFiTxs || []).length > 0, 
          link: "https://marginfi.com"
        },
        {
          name: "Kamino Airdrop",
          eligible: (kaminoData || []).length > 0, 
          link: "https://kamino.finance"
        },
        {
          name: "Parcl Airdrop",
          eligible: (parclTxs || []).length > 0,
          link: "https://parcl.co"
        },
        {
          name: "Drift Airdrop",
          eligible: (driftTxs || []).length > 0, 
          link: "https://www.drift.trade"
        }
      ];
  
      res.json(results);
    } catch (err) {
      console.error("Helius error:", err);
      res.status(500).json({ error: "Failed to check eligibility" });
    }
  });



  app.post('/api/check-eth', async (req, res) => {
    try {
      const { walletAddress } = req.body;
      const results = await checkAllEthereumAirdrops(walletAddress);
      res.json(results);
    } catch (error) {
      console.error('ETH Check Error:', error);
      res.status(500).json({ error: error.message });
    }
  });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


