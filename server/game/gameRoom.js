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
    this._finalizedMatchupsToSend = [];

    this._currentVotingMatchup = {};
    this._currentVotingResults = {};

    this._promptTimeout = null;
    this._votingTimeout = null;
    this._scoringTimeout = null;

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
    // Add to Player Sockets list
    this._playerSockets.push(playerSocket);

    // Update Player Info
    playerSocket.on("updateplayerinfo", (info) => {
      playerSocket.playerData.nickname = info.nickname;
      playerSocket.playerData.emoji = info.emoji;
      this.sendStateToAll();
    });

    // Submit an answer to a prompt
    playerSocket.on("answerprompt", (data) => {
      // TODO input validation
      this._prompts.answer(
        playerSocket.playerData.playerId,
        data.promptId,
        data.answer
      );
    });

    playerSocket.on("vote", (data) => {
      console.log(`received vote from ${data.id} for ${data.index}`);
      this._currentVotingResults[data.id] = data.index;
    });
  }

  addAdmin(adminSocket) {
    adminSocket.on("startGame", (data) => {
      if (this.can("startGame")) {
        this.startGame();
      }
    });

    adminSocket.on("closePrompts", (data) => {
      if (this.can("closePrompts")) {
        this.closePrompts();
      }
    });

    adminSocket.on("closeVoting", (data) => {
      if (this.can("closeVoting")) {
        this.closeVoting();
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
        prompts: prompts.map((p) => {
          return p.sendable;
        }),
      });
    }
  }

  sendStateToAll() {
    this.emitToAll("state", this.stateSummary());
  }

  sendStateToAdminsOnly() {
    this.emitToAdmins("state", this.stateSummary());
  }

  emitToAll(event, data) {
    this._io.in(this._code).emit(event, data);
  }

  emitToAdmins(event, data) {
    this._io.in(adminRoom(this._code)).emit(event, data);
  }

  // Relevant parts of state and data combined for sending to clients
  stateSummary() {
    let state = {
      players: this._playerSockets.map((socket) => socket.playerData),
      currentState: this.state,
    };
    return state;
  }

  prepareMatchupsToSend() {
    this._finalizedMatchupsToSend = this._prompts.finalizeMatchups();
    console.log("Finalized Matchups:", this._finalizedMatchupsToSend);
  }

  sendNextFilledPromptToAdmin() {
    if (this._finalizedMatchupsToSend.length === 0) {
      throw Error("no prompts left!");
    }
    this._currentVotingMatchup = this._finalizedMatchupsToSend.pop();
    this.emitToAdmins("nextfilledprompt", {
      prompt: this._currentVotingMatchup,
    });
  }

  sendVotingOptionsToPlayers() {
    this.emitToAll("votingoptions", {
      currentVotingMatchup: this._currentVotingMatchup,
    });
  }

  calculateScoreboardData() {
    return [
      { emoji: "🤲", nickname: "test", score: 1000 },
      { emoji: "💩", nickname: "sfsfx", score: 500 },
      { emoji: "👽", nickname: "sdkjfcxv", score: 350 },
      { emoji: "🦷", nickname: "hello", score: 200 },
    ];
  }
}

StateMachine.factory(GameRoom, {
  init: "lobby",
  transitions: [
    { name: "startGame", from: "lobby", to: "prompts" },
    { name: "closePrompts", from: "prompts", to: "voting" },
    { name: "closeVoting", from: "voting", to: "scoring" },
    { name: "nextSet", from: "scoring", to: "voting" },
    { name: "endRound", from: "scoring", to: "endOfRound" },
    { name: "nextRound", from: "endOfRound", to: "prompts" },
    { name: "endGame", from: "endOfRound", to: "finalScores" },
    { name: "newGameNewPlayers", from: "finalScores", to: "lobby" },
    { name: "newGameSamePlayers", from: "finalScores", to: "prompts" },
  ],
  methods: {
    onEnterState: function () {
      this.sendStateToAll();
    },
    onStartGame: function () {
      // TODO Implement
      console.log("Game Started");
    },
    onBeforeClosePrompts: function () {
      this.prepareMatchupsToSend();
      console.log("closePrompts");
    },
    onPrompts: function () {
      console.log("Prompts!");

      this.sendPrompts();

      // Time Limits
      this._promptTimeout = setTimeout(() => {
        if (this.can("closePrompts")) {
          this.closePrompts();
        }
      }, 20000); // TODO improve timer
    },
    onVoting: function () {
      this._currentVotingResults = {};
      this.sendNextFilledPromptToAdmin();
      this.sendVotingOptionsToPlayers();
      this._votingTimeout = setTimeout(() => {
        if (this.can("closeVoting")) {
          this.closeVoting();
        }
      }, 200000); // FIXME lower to 20 after testing, then fix timing someday
      console.log("initiateVoting");
    },
    onCloseVoting: function () {
      // TODO Implement
      console.log("closeVoting");
    },
    onScoring: function () {
      console.log("Scoring!");
      this.emitToAdmins("votingresults", {
        votingResults: this._currentVotingResults,
      });
      if (this._finalizedMatchupsToSend.length > 0) {
        this._scoringTimeout = setTimeout(() => {
          if (this.can("nextSet")) {
            this.nextSet();
          }
        }, 5000);
      } else {
        this._scoringTimeout = setTimeout(() => {
          if (this.can("endRound")) {
            this.endRound();
          }
        }, 5000);
      }
    },
    onNextSet: function () {
      // TODO Implement
      console.log("nextSet");
    },
    onEndRound: function () {
      this.emitToAdmins("scoreboarddata", {
        scoreboardData: this.calculateScoreboardData(),
      });
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
