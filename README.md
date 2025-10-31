# Hegends Sell Bot for Telegram

TG-Hegends is a Node.js application that monitors Solana blockchain transactions for NFT listings and sales, specifically for the Hegends collection. It processes these transactions and sends notifications to a Telegram channel.

## Features

- Monitors Solana blockchain transactions
- Extracts listing prices and seller information
- Fetches SOL price in USD
- Calculates fees and total prices
- Sends formatted notifications to Telegram
- Supports both Magic Eden and Tensor marketplaces

## Prerequisites

- Node.js (v14 or later recommended)
- npm (Node Package Manager)
- A Telegram bot token
- A Helius API key

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/tg-hegends.git
   cd tg-hegends
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   BOT_TOKEN=your_telegram_bot_token
   MAIN_CHAT=your_main_chat_id
   TEST_CHAT=your_test_chat_id
   HELIUS_KEY=your_helius_api_key
   PROD=false
   HELIUS_RPC_URL=helius_rpc_url
   COINGECKO_API_KEY=your_coingecko_api_key
   ```
   Replace the placeholder values with your actual credentials.

## Usage

To start the development server:

```
npm run dev
```

This will start the server on `http://localhost:3000`.

To send a test notification to the telegram bot:

```
curl -X POST http://localhost:3000 -H "Content-Type: application/json" -d "@requests/tensor_list.json"
```
