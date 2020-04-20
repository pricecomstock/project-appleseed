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
    this._endOfRoundTimeout = null;

    this._options = {
      numberOfRounds: 2,
      pointsPerPrompt: 1200,
      pointsForShutout: 200,
    };

    this._numberOfRoundsPlayed = 0;

    this._pointsMap = new Map();

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
    this._pointsMap.set(playerSocket.playerData.playerId, 0);

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

    adminSocket.on("nextSet", (data) => {
      if (this.can("nextSet") && this._finalizedMatchupsToSend.length > 0) {
        this.nextSet();
      }
    });

    adminSocket.on("endRound", (data) => {
      if (this.can("endRound")) {
        this.endRound();
      }
    });

    adminSocket.on("endGame", (data) => {
      if (this.can("endGame")) {
        this.endGame();
      }
    });

    adminSocket.on("nextRound", (data) => {
      if (this.can("nextRound")) {
        this.nextRound();
      }
    });

    adminSocket.on("newGameNewPlayers", (data) => {
      if (this.can("newGameNewPlayers")) {
        this.newGameNewPlayers();
      }
    });

    adminSocket.on("newGameSamePlayers", (data) => {
      if (this.can("newGameSamePlayers")) {
        this.newGameSamePlayers();
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
    // console.log("Prompts:", this._prompts);
    for (let [playerId, prompts] of this._prompts.promptsByPlayer) {
      let socket = this.getPlayerSocketWithId(playerId);
      // console.log(`Sending player ${playerId} socket:`, socket);
      console.log("Sending player prompts:", prompts);
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

  processVotingPoints() {
    this._currentVotingResults;
    // TODO
  }

  calculateScoreboardData() {
    const testData = [
      { emoji: "🤲", nickname: "test", score: 1000 },
      { emoji: "💩", nickname: "Andrew", score: 500 },
      { emoji: "👽", nickname: "Jason", score: 350 },
      { emoji: "🌿", nickname: "Ty", score: 200 },
      { emoji: "🧙", nickname: "Patrick", score: 200 },
      { emoji: "🙆‍♀️", nickname: "Sarah", score: 200 },
      { emoji: "🍞", nickname: "Mark", score: 200 },
      { emoji: "🌯", nickname: "Price", score: 0 },
    ];
    return testData;
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
    { name: "endGame", from: "scoring", to: "finalScores" },
    { name: "nextRound", from: "endOfRound", to: "prompts" },
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
      this._numberOfRoundsPlayed++;
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
      this.processVotingPoints();
      this.emitToAdmins("votingresults", {
        votingResults: this._currentVotingResults,
      });

      let nextTransition;

      if (this._finalizedMatchupsToSend.length > 0) {
        // More answers to read
        this._scoringTimeout = setTimeout(() => {
          if (this.can("nextSet")) {
            this.nextSet();
          }
        }, 5000);
      } else if (this._numberOfRoundsPlayed >= this._options.numberOfRounds) {
        // No more answers, no more rounds
        this._scoringTimeout = setTimeout(() => {
          if (this.can("endGame")) {
            this.endGame();
          }
        }, 5000);
      } else {
        // No more answers, but anther round
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
    onEndOfRound: function () {
      // on enter the state
      this._endOfRoundTimeout = setTimeout(() => {
        if (this.can("nextRound")) {
          this.nextRound();
        }
      }, 5000);
      this.emitToAdmins("scoreboarddata", {
        scoreboardData: this.calculateScoreboardData(),
      });
    },
    onNextRound: function () {
      // TODO Implement
      console.log("nextRound");
    },
    onEndGame: function () {
      this.emitToAdmins("scoreboarddata", {
        scoreboardData: this.calculateScoreboardData(),
      });
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
