const borsh = require('borsh');
const bs58 = require('bs58');

const schema = { 'struct': { 'nonce': 'u64', 'index':'u32','root':''} };
const data = "DriftzrhYnBpyknX7rHdjBKkvJ6AEnG7YT";
const decoded = borsh.deserialize(schema, Buffer.from(bs58.decode(data)));
console.log(decoded);