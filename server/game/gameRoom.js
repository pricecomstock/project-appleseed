const { generateBase64Id, adminRoom } = require("./util");
const StateMachine = require("javascript-state-machine");
const { PromptSet } = require("./prompts/prompt");
const PointTracker = require("./pointTracker");
const Timer = require("./timer");

class GameRoom {
  constructor(code, io) {
    //TODO: Add game options
    this._code = code;
    this._io = io;
    // this._manager = manager;

    // this._countdownWillEnd = 0;
    this._adminKey = generateBase64Id(32);
    this._playerSockets = [];
    this._adminSockets = [];

    this._prompts = {};
    this._finalizedMatchupsToSend = [];

    this._currentVotingMatchup = {};
    this._currentVotingResults = {};
    this._currentScoringDetails = {};

    this._timer = null;

    this._options = {
      numberOfRounds: 2,
      pointsPerPrompt: 1200,
      pointsForShutout: 200,

      promptTimeLimit: 90,
      votingTimeLimit: 22,
      roundDelay: 7,
    };

    this._numberOfRoundsPlayed = 0;

    this._pointTracker = null;

    // Game state
    this._fsm();
  }

  initializePointTracker() {
    this._pointTracker = new PointTracker(this.playerData, this._options);
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
    return this.state === "lobby";
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
      console.log(`received vote from ${data.playerId} for ${data.index}`);
      this._currentVotingResults[data.playerId] = data.index;
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
        this._timer.cancel();
        this.closePrompts();
      }
    });

    adminSocket.on("closeVoting", (data) => {
      if (this.can("closeVoting")) {
        this._timer.cancel();
        this.closeVoting();
      }
    });

    adminSocket.on("nextSet", (data) => {
      if (this.can("nextSet") && this._finalizedMatchupsToSend.length > 0) {
        this._timer.cancel();
        this.nextSet();
      }
    });

    adminSocket.on("endRound", (data) => {
      if (this.can("endRound")) {
        this._timer.cancel();
        this.endRound();
      }
    });

    adminSocket.on("endGame", (data) => {
      if (this.can("endGame")) {
        this._timer.cancel();
        this.endGame();
      }
    });

    adminSocket.on("nextRound", (data) => {
      if (this.can("nextRound")) {
        this._timer.cancel();
        this.nextRound();
      }
    });

    adminSocket.on("newGameNewPlayers", (data) => {
      if (this.can("newGameNewPlayers")) {
        this._timer.cancel();
        this.newGameNewPlayers();
      }
    });

    adminSocket.on("newGameSamePlayers", (data) => {
      if (this.can("newGameSamePlayers")) {
        this._timer.cancel();
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

  createAndSendTimer(seconds, onCompleteFunction) {
    this._timer = Timer.createWithSeconds(seconds, onCompleteFunction);
    this.emitToAll("timer", this._timer.summary());
  }

  processVotingPoints() {
    this._currentScoringDetails = this._pointTracker.distributePoints(
      this._currentVotingResults,
      this._currentVotingMatchup
    );
  }

  calculateScoreboardData() {
    // const testData = [
    //   { emoji: "🤲", nickname: "test", score: 1000 },
    //   { emoji: "💩", nickname: "Andrew", score: 500 },
    //   { emoji: "👽", nickname: "Jason", score: 350 },
    //   { emoji: "🌿", nickname: "Ty", score: 200 },
    //   { emoji: "🧙", nickname: "Patrick", score: 200 },
    //   { emoji: "🙆‍♀️", nickname: "Sarah", score: 200 },
    //   { emoji: "🍞", nickname: "Mark", score: 200 },
    //   { emoji: "🌯", nickname: "Price", score: 0 },
    // ];
    // return testData;
    let scoreboardData = this._pointTracker.sortedPointPairs().map((pair) => {
      let playerId = pair[0];
      let score = pair[1];
      let playerData = this.getPlayerDataWithId(playerId); // ew
      return {
        emoji: playerData.emoji,
        nickname: playerData.nickname,
        score: score,
      };
    });
    return scoreboardData;
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
      this.initializePointTracker();
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
      this.createAndSendTimer(this._options.promptTimeLimit, () => {
        if (this.can("closePrompts")) {
          this.closePrompts();
        }
      });
    },
    onVoting: function () {
      this._currentVotingResults = {};
      this.sendNextFilledPromptToAdmin();
      this.sendVotingOptionsToPlayers();
      this.createAndSendTimer(this._options.votingTimeLimit, () => {
        if (this.can("closeVoting")) {
          this.closeVoting();
        }
      });
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
        scoringDetails: this._currentScoringDetails,
      });

      if (this._finalizedMatchupsToSend.length > 0) {
        // More answers to read
        this.createAndSendTimer(this._options.roundDelay, () => {
          if (this.can("nextSet")) {
            this.nextSet();
          }
        });
      } else if (this._numberOfRoundsPlayed >= this._options.numberOfRounds) {
        // No more answers, no more rounds
        this.createAndSendTimer(this._options.roundDelay, () => {
          if (this.can("endGame")) {
            this.endGame();
          }
        });
      } else {
        // No more answers, but anther round
        this.createAndSendTimer(this._options.roundDelay, () => {
          if (this.can("endRound")) {
            this.endRound();
          }
        });
      }
    },
    onNextSet: function () {
      // TODO Implement
      console.log("nextSet");
    },
    onEndOfRound: function () {
      // on enter the state
      this.createAndSendTimer(this._options.roundDelay, () => {
        if (this.can("nextRound")) {
          this.nextRound();
        }
      });
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
