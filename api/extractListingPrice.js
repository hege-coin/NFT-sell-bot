const { Program } = require("@coral-xyz/anchor");
const { Connection, PublicKey } = require("@solana/web3.js");
const { SolanaParser } = require("@debridge-finance/solana-transaction-parser");
const BN = require("bn.js");

// Constants
const RPC_URL = "https://api.mainnet-beta.solana.com";
const INSTRUCTION_NAME = "listCore";
const SALE_INSTRUCTION_NAME = "buyCore"; // Name of the sale instruction for Tensor

// Initialize connection and provider
const connection = new Connection(RPC_URL);
const provider = { connection };

// Fetch IDL function
const fetchIdl = async (programId) => {
  try {
    const programPublicKey = new PublicKey(programId);
    return await Program.fetchIdl(programPublicKey, provider);
  } catch (error) {
    console.error("Error fetching IDL:", error);
    return null;
  }
};

// Helper function to safely convert BN to a JavaScript number or fallback
const bnToNumber = (bn) => {
  try {
    if (bn instanceof BN) {
      return bn.toNumber();
    }
    return null;
  } catch (error) {
    console.error("Error converting BN to number:", error);
    return null;
  }
};

// Main function to decode data
const extractListingPrice = async (data, action, origin) => {
  const programIdString =
    origin === "Tensor"
      ? "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
      : "M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K";

  let programId;
  try {
    programId = new PublicKey(programIdString);
  } catch (error) {
    console.error("Invalid programId:", programIdString);
    return;
  }

  const idl = await fetchIdl(programId);
  if (!idl) {
    console.error("Failed to fetch IDL");
    return;
  }

  const txParser = new SolanaParser([{ idl, programId }]);
  const parsed = await txParser.parseTransaction(
    connection,
    data[0].signature,
    false
  );

  if (origin === "Tensor") {
    return handleTensorTransaction(parsed, programId, action);
  } else if (origin === "ME") {
    return handleMagicEdenTransaction(parsed);
  } else {
    console.log("Invalid origin");
    return null;
  }
};

// Handle Tensor transactions (includes both listing and sale)
const handleTensorTransaction = (parsed, programId, action) => {
  // Determine instruction name based on action
  const instructionName =
    action === "Sell" ? SALE_INSTRUCTION_NAME : INSTRUCTION_NAME;

  const relevantInstructions = parsed.filter((instruction) => {
    if (instruction.programId && instruction.programId instanceof PublicKey) {
      return (
        instruction.programId.equals(programId) &&
        instruction.name === instructionName
      );
    }
    console.log("Invalid or missing programId for instruction:", instruction);
    return false;
  });

  if (relevantInstructions.length > 0) {
    // Handle Sale action
    if (action === "Sell") {
      const saleInstruction = relevantInstructions[0];
      return extractSaleAmount(saleInstruction);
    }

    // Handle Listing action
    const listingInstruction = relevantInstructions[0];
    const { amount } = listingInstruction.args;
    const rawAmount = bnToNumber(amount);

    console.log("Listing amount (in lamports):", rawAmount);

    return rawAmount;
  } else {
    console.log(
      `No matching ${action} instructions found for programId:`,
      programId.toBase58()
    );
    return null;
  }
};

// Extract amount from Sale transaction (`buyCore` instruction)
const extractSaleAmount = (saleInstruction) => {
  if (saleInstruction.args && saleInstruction.args.maxAmount) {
    const maxAmount = bnToNumber(saleInstruction.args.maxAmount);
    console.log("Sale amount (maxAmount in lamports):", maxAmount);
    return maxAmount;
  } else {
    console.log("No maxAmount found in the sale instruction args.");
    return null;
  }
};

// Handle Magic Eden transactions
const handleMagicEdenTransaction = (parsed) => {
  const relevantInstructions = parsed.filter((instruction) => {
    if (instruction.programId && instruction.programId instanceof PublicKey) {
      return instruction.name === "coreSell";
    }
    return false;
  });

  if (relevantInstructions.length > 0) {
    const coreSellInstruction = relevantInstructions[0];
    const { args } = coreSellInstruction;

    if (args && args.args) {
      const extractedArgs = args.args;
      console.log("Extracted args:", extractedArgs);

      const amount = extractedArgs.price
        ? bnToNumber(extractedArgs.price)
        : null;

      console.log("Amount (in lamports):", amount ?? "undefined");

      return amount;
    }
  } else {
    console.log("No coreSell instruction found in the parsed data.");
    return null;
  }
};

const extractSeller = (data) => {
  const seller = data[0].feePayer;
  const abbreviatedSeller = `${seller.slice(0, 4)}...${seller.slice(-4)}`;
  return { seller, abbreviatedSeller };
};

module.exports = { extractListingPrice, extractSeller };
