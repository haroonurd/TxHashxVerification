# TxHashxVerification

Developer-focused Ethereum transaction verification tool.
 
## Overview
A Node.js CLI tool to fetch Ethereum transaction details including: from/to addresses, gas usage, value, decoded input methods, and basic activity classification.

## Features
- Verify transaction hash on Ethereum mainnet or testnets
- Output JSON with detailed transaction info
- Decode ERC20 Transfer events
- Classify activity: ETH transfer, ERC20 transfer, contract interaction

## Installation
```bash
git clone <repo-url>
cd TxHashxVerification
npm install
```
Set RPC_URL in `.env`:
```
RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

## Usage
```bash
node index.js --tx <transaction_hash>
```

## Sample Output
```json
{
  "txHash": "0x...",
  "blockNumber": 1234567,
  "status": "Success",
  "from": "0x...",
  "to": "0x...",
  "valueEth": "0.5",
  "gasUsed": "21000",
  "activity": "ETH Transfer"
}
```

## License
MIT
