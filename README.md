Usage (README snippet)

Create a new folder and place the files above into it (maintain abi/common.json).

cp .env.example .env and set RPC_URL (Infura/Alchemy or other).

npm install

Run: node index.js --tx 0xYOURTXHASH

The script prints a JSON summary and additional decoded ERC20 Transfer lines when present.

Notes & Next steps

This is a starting point — you can extend the ABI database, add ENS lookups, decode more event types, map well-known contracts (Uniswap, Sushi, 1inch) for richer classification, and add unit tests.

Consider adding a web UI (React) or GitHub Actions for automated scanning.
