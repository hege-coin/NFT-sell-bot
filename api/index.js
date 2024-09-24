require('dotenv').config();


const TELEGRAM_BOT_TOKEN = process.env.BOT_TOKEN;
// const TELEGRAM_CHAT_ID = "-1002138064416";

// Main
if (process.env.PROD) {
    var TELEGRAM_CHAT_ID = process.env.MAIN_CHAT;
}
else {
    var TELEGRAM_CHAT_ID = process.env.TEST_CHAT;
}

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;



// Vercel API handler
export default async function (req, res) {
    if (req.method === 'POST') {
        const requestBody = req.body;

        if (requestBody[0].type !== 'TRANSFER') {
            console.log(requestBody[0].signature);

            const transactionData = await checkTransactionStatus(requestBody[0].signature);
            const action = extractTransactionType(transactionData.meta.logMessages);
            console.log(action);
            console.log("Transaction confirmed:", JSON.stringify(transactionData, null, 2));

            const Transfertimestamp = new Date(requestBody[0].timestamp * 1000).toLocaleString();
            const Transfersignature = `https://solana.fm/tx/${requestBody[0].signature}`;

            let url, mp, index;
            if (requestBody[0].instructions[2].programId === 'M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K') {
                // Handle Magic Eden
                url = `https://magiceden.us/marketplace/hegends?activeTab=myItems&solItemDetailsModal=`;
                mp = 'Magic Eden';
                index = 4;
            } else if (requestBody[0].instructions[2].programId === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp') {
                // Handle Tensor
                url = `https://www.tensor.trade/item/`;
                mp = 'Tensor';
                index = (action === 'Delist' || action === 'Listing') ? 0 : 2;
            } else {
                url = "";
                mp = '';
                index = 4;
            }

            const NFTmintAddress = requestBody[0].instructions[2]['accounts'][index];
            console.log(NFTmintAddress);
            const mintUrl = `https://solana.fm/address/${NFTmintAddress}`;
            const asset = await getAssetImageUrl(NFTmintAddress);
            const im = asset.content.links.image;
            const name = asset.content.metadata.name;
            const desc = asset.content.metadata.description;
            url += NFTmintAddress;

            const messageToSendTransfer =
                `<b>New ${action}!</b>\n\n<b>${name}</b>\n${desc}\n\n<b>Market:</b> <a href='${url}'>${mp}</a>\n\n<a href='${Transfersignature}'>TX</a> | <a href='${mintUrl}'>Mint</a> `;

            if (action === 'Sell' || action === 'Listing') {
                await sendToTelegramNFT(messageToSendTransfer, im);
            }
        } else {
            console.log('Transfer Transaction:');
        }

        res.status(200).send('Logged POST request body.');
    } else {
        res.status(405).send('Method not allowed.');
    }
}

// This function is used to check the transaction status
async function checkTransactionStatus(signature) {
    let transactionData = null;
    let attempts = 0;
    const maxAttempts = 10;
    const delay = 5000;

    while (transactionData === null && attempts < maxAttempts) {
        attempts++;
        console.log(`Attempt ${attempts} to check transaction status...`);

        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '1',
                method: 'getTransaction',
                params: [signature, { commitment: 'confirmed', encoding: 'json' }],
            }),
        });

        const data = await response.json();

        if (data.result !== null) {
            transactionData = data.result;
            console.log('Transaction confirmed');
            return transactionData;
        } else {
            console.log('Transaction not confirmed yet. Retrying...');
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.log('Max attempts reached, transaction still not confirmed.');
    return transactionData;
}

// This function checks the marketplace action
function extractTransactionType(logMessages) {
    let transactionType = 'Unknown';
    logMessages.forEach(log => {
        if (log.includes('Instruction: CoreBuy') || log.includes('Instruction: BuyCore')) {
            transactionType = 'Sell';
        } else if (log.includes('Instruction: CoreCancelSell') || log.includes('Instruction: DelistCore')) {
            transactionType = 'Delist';
        } else if (log.includes('Instruction: CoreSell') || log.includes('Instruction: ListCore')) {
            transactionType = 'Listing';
        }
    });
    return transactionType;
}

// This function sends the NFT updates to Telegram
async function sendToTelegramNFT(message, imageUrl) {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
    const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            photo: imageUrl,
            caption: message,
            parse_mode: "HTML"
        }),
    });
    const responseData = await response.json();

    if (!response.ok) {
        console.error('Failed to send photo to Telegram:', responseData);
    }
}

// This function gets images associated with NFTs
async function getAssetImageUrl(mintAddress) {
    const response = await fetch(HELIUS_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: '1',
            method: 'getAsset',
            params: { id: mintAddress },
        }),
    });
    const result = await response.json();
    return result.result;
}
