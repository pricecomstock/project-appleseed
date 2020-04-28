const generateBase64Id = require("./util").generateBase64Id;
const { randomEmoji, randomPlayerName } = require("./flavor");

class PlayerData {
  constructor() {
    this.connected = true;
    this.nickname = randomPlayerName();
    this.emoji = randomEmoji();
    this.playerId = generateBase64Id(12);
  }
}

module.exports = PlayerData;
