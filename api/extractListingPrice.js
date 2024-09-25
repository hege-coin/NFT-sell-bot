const { Program } = require("@coral-xyz/anchor");
const { Connection, PublicKey } = require("@solana/web3.js");
const { SolanaParser } = require("@debridge-finance/solana-transaction-parser");
const BN = require("bn.js");

// Constants
const RPC_URL = "https://api.mainnet-beta.solana.com";
const INSTRUCTION_NAME = "listCore";

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
    // Check if it's a BN instance and safely convert
    if (bn instanceof BN) {
      // Use `.toNumber()` if you're sure it's safe (less than 53-bit precision)
      return bn.toNumber();
    }
    return null;
  } catch (error) {
    console.error("Error converting BN to number:", error);
    return null;
  }
};

// Main function to decode data
const extractListingPrice = async (data, origin) => {
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

  // console.log("Fetching IDL for program:", programId.toBase58());
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

  console.log(parsed);

  if (origin === "Tensor") {
    // HANDLE TENSOR
    const relevantInstructions = parsed.filter((instruction) => {
      if (instruction.programId && instruction.programId instanceof PublicKey) {
        // console.log(
        //   "Comparing Program IDs:",
        //   instruction.programId.toBase58(),
        //   programId.toBase58()
        // );
        return (
          instruction.programId.equals(programId) &&
          instruction.name === INSTRUCTION_NAME
        );
      }
      console.log("Invalid or missing programId for instruction:", instruction);
      return false;
    });

    if (relevantInstructions.length > 0) {
      // Use map to return an array, but select the first value
      const rawAmounts = relevantInstructions.map((instruction) => {
        const { amount } = instruction.args;
        const rawAmount = bnToNumber(amount);
        return rawAmount;
      });

      return rawAmounts[0];
    } else {
      console.log(
        "No matching instructions found for programId:",
        programId.toBase58()
      );
      return null;
    }
  } else {
    // HANDLE MAGIC EDEEN
    return handleMagicEdenTransaction(parsed);
  }
};

const handleMagicEdenTransaction = (parsed) => {
  const relevantInstructions = parsed.filter((instruction) => {
    if (instruction.programId && instruction.programId instanceof PublicKey) {
      return instruction.name === "coreSell";
    }
    return false;
  });

  if (relevantInstructions.length > 0) {
    const coreSellInstruction = relevantInstructions[0]; // Assuming we care about the first match
    const { args } = coreSellInstruction;

    // Inspect and extract data from the args
    if (args && args.args) {
      const extractedArgs = args.args;

      console.log("Extracted args:", extractedArgs);

      // Check if the extractedArgs contains an amount or any other relevant field
      // If it is a BN instance, convert it using bnToNumber
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
