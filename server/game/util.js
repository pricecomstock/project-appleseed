const crypto = require("crypto");

function generateBase64Id(numCharacters) {
  // Synchronous
  // 3 bytes = 4 base 64 characters
  const num_bytes = Math.floor(numCharacters * 0.75);
  const buf = crypto.randomBytes(num_bytes);
  return buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
}

module.exports = {
  generateBase64Id,
};
