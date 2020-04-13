const generateBase64Id = require("./util").generateBase64Id;

class PlayerData {
  constructor() {
    this.connected = true;
    this.nickname = "human-" + generateBase64Id(4);
    this.emoji = "😀";
    this.playerId = generateBase64Id(12);
  }
}

module.exports = PlayerData;
