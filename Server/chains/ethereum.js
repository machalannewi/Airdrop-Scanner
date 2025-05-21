import { Alchemy, Network } from 'alchemy-sdk';
import { ethers } from 'ethers';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET
});

// --- Core Functions ---
const isValidEthAddress = (address) => ethers.isAddress(address);

// 1. Arbitrum Check
const checkArbitrum = async (address) => {
  const txs = await alchemy.core.getAssetTransfers({
    toAddress: address,
    toContractAddress: '0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a', // Arbitrum Bridge
    excludeZeroValue: true,
    category: ['external', 'erc20'],
    withMetadata: true
  });
  return txs.transfers.some(tx => 
    new Date(tx.metadata.blockTimestamp) < new Date('2023-03-01')
  );
};

// 2. Optimism Check
const checkOptimism = async (address) => {
  const logs = await alchemy.core.getLogs({
    address: '0x4200000000000000000000000000000000000042', // OP Token
    topics: [ethers.id('Transfer(address,address,uint256)'), null, ethers.zeroPadValue(address, 32)]
  });
  return logs.length > 0;
};

// 3. Starknet Check (via Voyager API)
const checkStarknet = async (address) => {
    try {
      const res = await axios.get(
        `https://voyager.online/api/v1/contracts/${address}/txns?ps=10&p=1`
      );
      return res.data.items.length >= 3; // At least 3 transactions
    } catch {
      return false;
    }
  };

// 4. zkSync Check
const checkZkSync = async (address) => {
    try {
      const res = await axios.get(
        `https://block-explorer-api.mainnet.zksync.io/address/${address}`
      );
      return res.data.balance !== '0';
    } catch {
      return false;
    }
  };

// 5. LayerZero Check
const checkLayerZero = async (address) => {
    try {
      const res = await axios.get(
        `https://api.layerzeroscan.com/api/trpc/address.getTransactions?input=${encodeURIComponent(
          JSON.stringify({
            json: { address, chainIds: [1, 101] }, // ETH + mainnets
            meta: { values: { chainIds: ["1", "101"] } }
          })
        )}`,
        { headers: { 'Authorization': `Bearer ${process.env.LAYERZERO_API_KEY}` } }
      );
      return res.data.result.data.json.totalTransactions > 2;
    } catch {
      return false;
    }
  };

// 6. EigenLayer Check
const checkEigenLayer = async (address) => {
    try {
      const res = await axios.post(
        'https://api.goldsky.com/api/public/project_clu2wgv5v5wjf01wkgtje5gx4/subgraphs/eigenlayer/1.0.0/gn',
        {
          query: `{
            deposits(where: { depositor: "${address.toLowerCase()}" }, first: 1) {
              id
            }
          }`
        }
      );
      return res.data.data.deposits.length > 0;
    } catch {
      return false;
    }
  };

// --- Main Checker ---
// Updated Ethereum airdrop checks (June 2024)
export const checkAllEthereumAirdrops = async (address) => {
    if (!ethers.isAddress(address)) throw new Error('Invalid ETH address');
  
    return await Promise.all([
      { name: 'Arbitrum', check: checkArbitrum, link: 'https://arbitrum.io' },
      { name: 'Optimism', check: checkOptimism, link: 'https://optimism.io' },
      { name: 'Starknet', check: checkStarknet, link: 'https://starknet.io' },
      { name: 'zkSync', check: checkZkSync, link: 'https://zksync.io' },
      { name: 'LayerZero', check: checkLayerZero, link: 'https://layerzero.network' },
      { name: 'EigenLayer', check: checkEigenLayer, link: 'https://eigenlayer.xyz' }
    ].map(async ({ name, check, link }) => ({
      name: `${name} Airdrop`,
      eligible: await check(address),
      link
    })));
  };