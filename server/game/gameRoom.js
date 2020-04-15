const { generateBase64Id, adminRoom } = require("./util");
const StateMachine = require("javascript-state-machine");
const { PromptSet } = require("./prompts/prompt");

class GameRoom {
  constructor(code, io) {
    //TODO: Add game options
    this._code = code;
    this._io = io;
    // this._manager = manager;

    // this._countdownWillEnd = 0;
    this._adminKey = generateBase64Id(32);
    this._allowedToJoin = true; // FIXME needs to be checked on reconnect
    this._playerSockets = [];
    this._adminSockets = [];

    this._prompts = {};

    // Game state
    this._fsm();
  }

  get adminKey() {
    return this._adminKey;
  }

  get code() {
    return this._code;
  }

  getPlayerDataWithId(playerId) {
    let playerSocket = this.getPlayerSocketWithId(playerId);

    if (playerSocket && playerSocket.playerData) {
      return playerSocket.playerData;
    }
  }

  getPlayerSocketWithId(playerId) {
    return this._playerSockets.find((playerSocket) => {
      return playerSocket.playerData.playerId === playerId;
    });
  }

  get allowedToJoin() {
    return this._allowedToJoin;
  }

  addPlayer(playerSocket) {
    this._playerSockets.push(playerSocket);
  }

  addAdmin(adminSocket) {
    adminSocket.on("startGame", (data) => {
      if (this.can("startGame")) {
        this.startGame();
      }
    });

    this._adminSockets.push(adminSocket);
  }

  get playerData() {
    return this._playerSockets.map((playerSocket) => {
      return playerSocket.playerData;
    });
  }

  sendPrompts() {
    this._prompts = new PromptSet(this.playerData.map((pd) => pd.playerId));
    // console.log("It's prompts time!", this._prompts);
    for (let [playerId, prompts] of this._prompts.promptsByPlayer) {
      let socket = this.getPlayerSocketWithId(playerId);
      // console.log(`Sending player ${playerId} socket:`, socket);
      // console.log("Prompts:", prompts);
      socket.emit("prompts", {
        prompts,
      });
    }
  }

  // Relevant parts of state and data combined for sending to clients
  stateSummary() {
    let state = {
      players: this._playerSockets.map((socket) => socket.playerData),
      currentState: this.state,
    };
    return state;
  }
}

StateMachine.factory(GameRoom, {
  init: "lobby",
  transitions: [
    { name: "startGame", from: "lobby", to: "prompts" },
    { name: "closePrompts", from: "prompts", to: "reading" },
    { name: "initiateVoting", from: "reading", to: "voting" },
    { name: "closeVoting", from: "voting", to: "scoring" },
    { name: "nextSet", from: "scoring", to: "reading" },
    { name: "endRound", from: "scoring", to: "endOfRound" },
    { name: "nextRound", from: "endOfRound", to: "prompts" },
    { name: "endGame", from: "endOfRound", to: "finalScores" },
    { name: "newGameNewPlayers", from: "finalScores", to: "lobby" },
    { name: "newGameSamePlayers", from: "finalScores", to: "prompts" },
  ],
  methods: {
    sendStateToAll: function () {
      // console.log("emitting room state to " + this._code);
      // console.log("Updated State: ", this.stateSummary());
      this._io.in(this._code).emit("state", this.stateSummary());
    },
    sendStateToAdminsOnly: function (params) {
      this._io.in(adminRoom(this._code)).emit("state", this.stateSummary());
    },
    onEnterState: function () {
      this.sendStateToAll();
    },
    onStartGame: function () {
      // TODO Implement
      console.log("Game Started");
    },
    onClosePrompts: function () {
      // TODO Implement
      console.log("closePrompts");
    },
    onPrompts: function () {
      console.log("Prompts!");

      this.sendPrompts();

      // Time Limits
      setTimeout(() => {
        this.closePrompts();
      }, 80000);
    },
    onInitiateVoting: function () {
      // TODO Implement
      setTimeout(() => {
        this.closeVoting();
      }, 20000);
      console.log("initiateVoting");
    },
    onCloseVoting: function () {
      // TODO Implement
      console.log("closeVoting");
    },
    onNextSet: function () {
      // TODO Implement
      console.log("nextSet");
    },
    onEndRound: function () {
      // TODO Implement
      console.log("endRound");
    },
    onNextRound: function () {
      // TODO Implement
      console.log("nextRound");
    },
    onEndGame: function () {
      // TODO Implement
      console.log("endGame");
    },
    onNewGameNewPlayers: function () {
      // TODO Implement
      console.log("newGameNewPlayers");
    },
    onNewGameSamePlayers: function () {
      // TODO Implement
      console.log("newGameSamePlayers");
    },
  },
});

module.exports = GameRoom;
