const Game = require("./game");

class Room {
  constructor(code, adminKey, data) {
    //TODO: Add game options
    this._code = code;

    // TODO: Maybe hash this but it definitely does not matter for first demo
    this._adminKey = adminKey;
    this._players = [];

    // Room state
    this._game = new Game();
  }

  get code() {
    return this._code;
  }

  get choices() {
    return this._choices;
  }

  getPlayerWithId(playerId) {
    return this._players.find((player) => {
      return player.playerId === playerId;
    });
  }

  // TODO: Add player object and use that to track player votes and states.
  // It would probably work ok across different games and stuff too.
  addPlayer(player) {
    this._players.push(player);
  }

  get players() {
    return this._players;
  }

  get gameState() {
    return this._game.state;
  }

  summary() {
    let state = {
      players: this.players,
    };
    return state;
  }
}

module.exports = Room;
