const crypto = require("crypto");

function generateBase64Id(numCharacters) {
  // Synchronous
  // 3 bytes = 4 base 64 characters
  const num_bytes = Math.floor(numCharacters * 0.75);
  const buf = crypto.randomBytes(num_bytes);
  return buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
}

function adminRoom(roomCode) {
  return `${roomCode}_admin`;
}

function playerRoom(roomCode) {
  return `${roomCode}_player`;
}

function audienceRoom(roomCode) {
  return `${roomCode}_audience`;
}

module.exports = {
  generateBase64Id,
  adminRoom,
  playerRoom,
  audienceRoom,
};
