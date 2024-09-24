const borsh = require('borsh');

// Define the CoreSellArgs structure
class CoreSellArgs {
    constructor(price, expiry, compressionProof) {
        this.price = price;
        this.expiry = expiry;
        this.compressionProof = compressionProof;
    }
}

// Define the schema for Borsh
const CoreSellArgsSchema = new Map([
    [CoreSellArgs, {
        kind: 'struct',
        fields: [
            ['price', 'string'],           // Unsigned 64-bit integer
            ['expiry', 'string'],          // Signed 64-bit integer (can be negative)
            ['compressionProof', { kind: 'option', type: ['u8'] }] // Nullable field
        ]
    }]
]);

// Example binary data (replace this with actual Solana instruction data)
const data = 'DriftzrhYnBpyknX7rHdjBKkvJ6AEnG7YT'/* binary data in Uint8Array format */;

// Deserialize the data using Borsh
function deserializeCoreSellArgs(data) {
    return borsh.deserialize(CoreSellArgsSchema, CoreSellArgs, data);
}

const coreSellArgs = deserializeCoreSellArgs(data);
console.log(coreSellArgs);
