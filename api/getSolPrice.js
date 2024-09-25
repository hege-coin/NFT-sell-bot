// fetch sol price from coingecko

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

const fetchSolPrice = async () => {
  const headers = {
    "Content-Type": "application/json",
    "x-cg-demo-api-key": COINGECKO_API_KEY,
  };
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { headers }
  );
  const data = await response.json();
  return data.solana.usd;
};

module.exports = { fetchSolPrice };
