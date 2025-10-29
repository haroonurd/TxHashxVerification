#!/usr/bin/env node
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import yargs from 'yargs/yargs'; 
import { hideBin } from 'yargs/helpers';

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .option('tx', { type: 'string', describe: 'Transaction hash to verify', demandOption: true })
  .option('rpc', { type: 'string', describe: 'RPC URL (overrides .env RPC_URL)' })
  .option('chain', { type: 'string', describe: 'Chain name for display', default: process.env.CHAIN || 'mainnet' })
  .help()
  .argv;

const RPC_URL = argv.rpc || process.env.RPC_URL;
if (!RPC_URL) {
  console.error('RPC_URL not provided. Set RPC_URL in .env or pass --rpc');
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(RPC_URL);
const abiPath = path.join(process.cwd(), 'abi', 'common.json');
let commonAbi = {};
try {
  commonAbi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
} catch (e) {
  console.warn('Could not load abi/common.json — continuing with limited decoding');
}

async function tryFetchERC20Symbol(addr) {
  try {
    const contract = new ethers.Contract(addr, commonAbi.ERC20 || [], provider);
    const symbol = await contract.symbol().catch(() => null);
    const name = await contract.name().catch(() => null);
    const decimals = await contract.decimals().catch(() => null);
    return { symbol, name, decimals };
  } catch (e) {
    return { symbol: null, name: null, decimals: null };
  }
}

function classifyActivity(tx, receipt) {
  if (!tx) return 'Unknown';
  if (!tx.to) return 'Contract Creation';
  if ((!tx.data || tx.data === '0x' || tx.data.length <= 2) && (!receipt || (receipt.logs && receipt.logs.length === 0))) {
    return 'ETH Transfer';
  }
  const transferSig = ethers.id('Transfer(address,address,uint256)');
  const logs = receipt ? receipt.logs : [];
  const hasERC20Transfer = logs.some(l => l.topics && l.topics[0] === transferSig);
  if (hasERC20Transfer) return 'ERC20 Transfer(s)';
  return 'Contract Interaction';
}

async function decodeInput(tx) {
  if (!tx.data || tx.data === '0x') return null;
  const combinedAbi = [];
  if (commonAbi.UNISWAP_V2_ROUTER) combinedAbi.push(...commonAbi.UNISWAP_V2_ROUTER);
  if (commonAbi.ERC20) combinedAbi.push(...commonAbi.ERC20);
  if (combinedAbi.length === 0) return null;
  const iface = new ethers.Interface(combinedAbi);
  try {
    const parsed = iface.parseTransaction({ data: tx.data, value: tx.value });
    return parsed;
  } catch (e) {
    return null;
  }
}

async function main() {
  const txHash = argv.tx;
  console.log(`Fetching tx ${txHash} on ${argv.chain}...`);
  let tx;
  try {
    tx = await provider.getTransaction(txHash);
  } catch (e) {
    console.error('Error fetching transaction:', e.message || e);
    process.exit(1);
  }
  if (!tx) {
    console.error('Transaction not found. Check the hash and RPC node.');
    process.exit(1);
  }
  const receipt = await provider.getTransactionReceipt(txHash);
  const activity = classifyActivity(tx, receipt);
  const decoded = await decodeInput(tx);
  const gasUsed = receipt ? receipt.gasUsed.toString() : 'pending';
  const gasPrice = tx.gasPrice ? tx.gasPrice.toString() : (tx.maxFeePerGas ? tx.maxFeePerGas.toString() : null);
  const valueEth = ethers.formatEther(tx.value || 0);
  const report = {
    txHash: tx.hash,
    blockNumber: tx.blockNumber,
    status: receipt ? (receipt.status === 1 ? 'Success' : 'Failed') : 'Pending',
    from: tx.from,
    to: tx.to,
    valueEth,
    gasUsed,
    gasPrice,
    confirmations: tx.confirmations,
    inputMethod: decoded ? decoded.name : null,
    inputArgs: decoded ? decoded.args : null,
    activity,
    logsCount: receipt ? receipt.logs.length : 0
  };
  console.log(JSON.stringify(report, null, 2));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
