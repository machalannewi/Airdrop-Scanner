import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isValidSolanaAddress, heliusRPC } from './chains/solana.js'; // Import the Solana functions





// Load environment variables from .env file
dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// Middleware
app.use(cors(
    {
        origin: 'http://localhost:5175', // Allow requests from the frontend
        methods: ['POST', 'GET'], // Allow POST and GET methods
        credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    }
)); // Allow frontend requests
app.use(express.json()); 


  app.post('/api/check', async (req, res) => {
    const { walletAddress, selectedChain } = req.body;
  
    if (selectedChain !== 'solana') {
      return res.json([]); // Skip if not Solana
    }
  
    if (!isValidSolanaAddress(walletAddress)) {
      return res.status(400).json({ error: "Invalid Solana address" });
    }
  
    try {
      // 1. Jito (JTO) - Check token holdings
      const jitoTokens = await heliusRPC("getTokenAccountsByOwner", [
        walletAddress,
        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
        { encoding: "jsonParsed", filters: [
          { memcmp: { offset: 0, bytes: process.env.JITO_MINT_ADDRESS } } // Replace with actual JTO mint
        ]}
      ]).catch(() => ({ value: [] }));
  
      // 2. Tensor (TNSR) - Check NFT trades
      const tensorTxs = await heliusRPC("getSignaturesForAddress", [
        walletAddress,
        {
          limit: 100,
          until: "2024-03-31T00:00:00Z", // Tensor airdrop cutoff
          filters: [{ programId: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN" }] // Tensor program
        }
      ]).catch(() => []);
  
      // 3. MarginFi (MRGN) - Check lending activity
      const marginFiTxs = await heliusRPC("getProgramAccounts", [
        "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA", // MarginFi program
        {
          encoding: "jsonParsed",
          filters: [{ memcmp: { offset: 8, bytes: walletAddress } }]
        }
      ]).catch(() => []);
  
      // 4. Kamino (KMNO) - Check liquidity positions
      const kaminoData = await heliusRPC("getTokenAccountsByOwner", [
        walletAddress,
        { programId: "KaminoProgramId" }, // Replace with actual
        { filters: [{ dataSize: 324 }]} // Kamino LP account size
      ]).catch(() => []);
  
      // 5. Parcl (PRCL) - Check real estate trades
      const parclTxs = await heliusRPC("getSignaturesForAddress", [
        "ParclProgramId", // Replace
        { limit: 10, filters: [{ memcmp: { offset: 32, bytes: walletAddress } }] }
      ]).catch(() => []);
  
      // 6. Drift (DRIFT) - Check perpetual trades
      const driftTxs = await heliusRPC("getSignaturesForAddress", [
        "DRiFTvSo4xfGMQLEXuj4RVZe7vk3R8B9GtH8R1QDWXbz", // Drift program
        { limit: 10, filters: [{ memcmp: { offset: 8, bytes: walletAddress } }] }
      ]).catch(() => []);
  
      // Format results
      const results = [
        {
          name: "Jito Airdrop",
          eligible: (jitoTokens?.value || []).length > 0,
          link: "https://jito.network"
        },
        {
          name: "Tensor Airdrop",
          eligible: (tensorTxs || []).length >= 3, // Minimum 3 trades
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





// app.post('/api/check', async (req, res) => {
//   const { walletAddress, selectedChain } = req.body;

//   // Solana Check
//   if (selectedChain === 'solana') {
//     if (!isValidSolanaAddress(walletAddress)) {
//       return res.status(400).json({ error: "Invalid Solana address" });
//     }

//     try {
//       // Check for Jito airdrop eligibility (example)
//       const response = await axios.post(
//         `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`,
//         {
//           jsonrpc: "2.0",
//           id: "1",
//           method: "getTokenAccountsByOwner",
//           params: [
//             walletAddress,
//             { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" }, // SPL Token program
//             { encoding: "jsonParsed" },
//           ],
//         }
//       );

//       const hasJitoTokens = response.data.result.value.some(
//         (account) => account.account.data.parsed.info.mint === process.env.JITO_MINT_ADDRESS // Replace with actual mint
//       );

//       res.json([{ 
//         name: "Jito Airdrop", 
//         eligible: hasJitoTokens, 
//         link: "https://jito.network" 
//       }]);
//     } catch (err) {
//       console.error("Helius error:", err);
//       res.status(500).json({ error: "Failed to check Solana eligibility" });
//     }
//   }
// });


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


