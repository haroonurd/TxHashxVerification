# TxHashxVerification — Ethereum Transaction Verifier

A simple Node.js CLI tool to verify Ethereum transaction hashes, showing details such as gas spent, from/to addresses, decoded method (if available), and basic classification (ETH transfer, ERC20 transfer, contract interaction).

### Usage

1. Clone this repo and install dependencies:
   ```bash
   npm install
   ```

2. Set your RPC URL in `.env` (or use Infura/Alchemy key):
   ```bash
   RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   ```

3. Run the script:
   ```bash
   node index.js --tx <your_tx_hash>
   ```

It will print a JSON summary of transaction details.

---
**Author:** Mr. Rashid  
**License:** MIT
