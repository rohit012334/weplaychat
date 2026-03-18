const Cryptr = require("cryptr");

function getCryptr() {
  const secret = process.env.CRYPTR_SECRET || process.env.secretKey;
  if (!secret) {
    throw new Error("Missing env var: CRYPTR_SECRET (or secretKey)");
  }
  return new Cryptr(secret);
}

module.exports = getCryptr;

