const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

class CoingeckoController {
  constructor() {
    this.baseUrl = "https://api.coingecko.com/api/v3";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "x-cg-demo-api-key": COINGECKO_API_KEY,
    };
  }

  async makeRequest(endpoint, params = {}) {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );

    const response = await fetch(url, { headers: this.defaultHeaders });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async fetchSolPrice() {
    const data = await this.makeRequest("/simple/price", {
      ids: "solana",
      vs_currencies: "usd",
    });
    return data.solana.usd;
  }

  async extractNftPrice(transaction) {
    // This is a placeholder implementation. You'll need to adjust this
    // based on your specific transaction structure and requirements.
    if (transaction.type === "NFT_SALE") {
      return transaction.amount;
    } else if (transaction.type === "NFT_LISTING") {
      return transaction.listPrice;
    } else {
      throw new Error("Transaction is not an NFT sale or listing");
    }
  }

  async getHegends() {
    const data = await this.makeRequest("/nfts/hegends");
    return data;
  }

  // You can easily add more methods here that use the makeRequest method
  async fetchTokenInfo(tokenId) {
    return this.makeRequest(`/coins/${tokenId}`);
  }

  // ... other methods ...
}

module.exports = new CoingeckoController();
