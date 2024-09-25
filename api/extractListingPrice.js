import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { SolanaParser } from "@debridge-finance/solana-transaction-parser";
import BN from "bn.js"; // Import BN for handling large numbers

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
export const extractListingPrice = async (data) => {
  const programIdString =
    data[0].instructions[2].innerInstructions[2].programId;

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
};
