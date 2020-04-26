const { generateBase64Id, adminRoom } = require("./util");
const StateMachine = require("javascript-state-machine");
const { PromptSet } = require("./prompts/prompt");
const PointTracker = require("./pointTracker");
const Timer = require("./timer");
const lodash = require("lodash");

const C = require("../../src/constants");

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
      maxPlayers: 16,

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
    return (
      this.state === "lobby" &&
      this._playerSockets.length < this._options.maxPlayers
    );
  }

  get canStart() {
    return this._playerSockets.length >= 2;
  }

  replacePlayerSocketForId(playerId, replacementSocket) {
    let oldIndex = this._playerSockets.findIndex((socket) => {
      return socket.playerData.playerId === playerId;
    });
    this._playerSockets.splice(oldIndex, 1); // delete old
    this.addPlayer(replacementSocket); // add new, with listeners
  }

  addPlayer(playerSocket) {
    // Add to Player Sockets list
    this._playerSockets.push(playerSocket);

    // Update Player Info
    playerSocket.on("updateplayerinfo", (info) => {
      playerSocket.playerData.nickname = info.nickname.substring(
        0,
        C.MAX_NAME_CHARS
      );
      playerSocket.playerData.emoji = lodash.toArray(info.emoji)[0];
      this.sendStateToAll();
    });

    // Submit an answer to a prompt
    playerSocket.on("answerprompt", (data) => {
      console.log(`Received answer to ${data.promptId}: ${data.answer}`);
      this._prompts.answer(
        playerSocket.playerData.playerId,
        data.promptId,
        data.answer.substring(0, C.MAX_ANSWER_CHARS)
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

  sendUnansweredPromptsToPlayer(playerSocket) {
    let unansweredPrompts = this._prompts
      .getUnansweredPromptsForPlayer(playerSocket.playerData.playerId)
      .map((p) => {
        return p.sendable;
      });
    playerSocket.emit("prompts", {
      prompts: unansweredPrompts,
    });
  }

  givePlayerCurrentInfo(playerSocket) {
    // For reconnects
    if (this.state === "prompts") {
      this.sendUnansweredPromptsToPlayer(playerSocket);
    }
  }

  get playerData() {
    return this._playerSockets.map((playerSocket) => {
      return playerSocket.playerData;
    });
  }

  createPromptSet() {
    this._prompts = new PromptSet(this.playerData.map((pd) => pd.playerId));
  }

  sendPromptsToPlayers() {
    for (let playerSocket of this._playerSockets) {
      console.log("Sending player prompts:");
      this.sendUnansweredPromptsToPlayer(playerSocket);
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

  prepareFinalizedMatchupsToSend() {
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
    //   { emoji: "🌯", nickname: "Price", score: 0 },
    //   { emoji: "🌯", nickname: "Price", score: 0 },
    //   { emoji: "🌯", nickname: "Price", score: 0 },
    //   { emoji: "🌯", nickname: "Price", score: 0 },
    //   { emoji: "🌯", nickname: "Price", score: 0 },
    //   { emoji: "🌯", nickname: "Price", score: 0 },
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
      this.prepareFinalizedMatchupsToSend();
      console.log("closePrompts");
    },
    onPrompts: function () {
      console.log("Prompts!");
      this._numberOfRoundsPlayed++;
      this.createPromptSet();
      this.sendPromptsToPlayers();

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
  },
});

module.exports = GameRoom;
