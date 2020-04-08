const StateMachine = require("javascript-state-machine");

class Game {
  constructor() {
    this._fsm = new StateMachine({
      init: "preGame",
      transitions: [
        { name: "startGame", from: "preGame", to: "prompts" },
        { name: "closePrompts", from: "prompts", to: "reading" },
        { name: "initiateVoting", from: "reading", to: "voting" },
        { name: "closeVoting", from: "voting", to: "scoring" },
        { name: "nextSet", from: "scoring", to: "reading" },
        { name: "endRound", from: "scoring", to: "endOfRound" },
        { name: "nextRound", from: "endOfRound", to: "prompts" },
        { name: "endGame", from: "endOfRound", to: "finalScores" },
        { name: "newGameNewPlayers", from: "finalScores", to: "preGame" },
        { name: "newGameSamePlayers", from: "finalScores", to: "prompts" },
      ],
      methods: {
        onStartGame: function () {
          console.log("Game Started");
        },
        onClosePrompts: function () {
          console.log("closePrompts");
        },
        onInitiateVoting: function () {
          console.log("initiateVoting");
        },
        onCloseVoting: function () {
          console.log("closeVoting");
        },
        onNextSet: function () {
          console.log("nextSet");
        },
        onEndRound: function () {
          console.log("endRound");
        },
        onNextRound: function () {
          console.log("nextRound");
        },
        onEndGame: function () {
          console.log("endGame");
        },
        onNewGameNewPlayers: function () {
          console.log("newGameNewPlayers");
        },
        onNewGameSamePlayers: function () {
          console.log("newGameSamePlayers");
        },
      },
    });
  }

  get state() {
    return this._fsm.state;
  }
}

module.exports = Game;
