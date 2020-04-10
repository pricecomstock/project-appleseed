const Game = require("./game");
const generateBase64Id = require("./util").generateBase64Id;

class Room {
  constructor(code, io) {
    //TODO: Add game options
    this._code = code;
    // this._manager = manager;

    this._adminKey = generateBase64Id(32);
    this._allowedToJoin = true; // FIXME needs to be checked on reconnect
    this._playerSockets = [];
    this._adminSockets = [];

    // Room state
    this._game = new Game(
      this._code,
      this._playerSockets,
      this._adminSockets,
      io
    );
  }

  get adminKey() {
    return this._adminKey;
  }

  get code() {
    return this._code;
  }

  getPlayerDataWithId(playerId) {
    let playerSocket = this._playerSockets.find((player) => {
      return player.playerData.playerId === playerId;
    });

    if (playerSocket && playerSocket.playerData) {
      return playerSocket.playerData;
    }
  }

  get allowedToJoin() {
    return this._allowedToJoin;
  }

  // TODO: Add player object and use that to track player votes and states.
  // It would probably work ok across different games and stuff too.
  addPlayer(playerSocket) {
    this._playerSockets.push(playerSocket);
  }

  get players() {
    return this._playerSockets;
  }

  get playerData() {
    return this._playerSockets.map((playerSocket) => {
      return playerSocket.playerData;
    });
  }

  get gameState() {
    return this._game.state;
  }

  summary() {
    let state = {
      global: {
        players: this._playerSockets.map((socket) => socket.playerData),
        currentState: this._game.state,
      },
    };
    return state;
  }

  addAdmin(adminSocket) {
    adminSocket.on("startGame", (data) => {
      if (this._game.can("startGame")) {
        this._game.startGame();
      }
    });

    this._adminSockets.push(adminSocket);
  }
}

module.exports = Room;
