const StateMachine = require("javascript-state-machine");

class Game {
  constructor(roomCode, playerSockets, adminSockets, io) {
    this._roomCode = roomCode;

    this._io = io;
    this._playerSockets = playerSockets;
    this._adminSockets = adminSockets;

    // Initialize state machine
    this._fsm();
  }
}

StateMachine.factory(Game, {
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
      this._io.in(this._roomCode).emit("gameState", { gameState: this.state });
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
      // Time Limits
      setTimeout(() => {
        this.closePrompts();
      }, 80000);

      console.log(this._playerSockets);
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

module.exports = Game;
