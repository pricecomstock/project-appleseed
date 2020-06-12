const { generateBase64Id, adminRoom } = require("./util");
const StateMachine = require("javascript-state-machine");
const { PromptRound } = require("./prompts/prompt");
const { PromptPicker } = require("./prompts/promptPicker");
const { getRandomTheme } = require("./flavor/themes");
const options = require("./options");
const PointTracker = require("./pointTracker");
const Timer = require("./timer");
const lodash = require("lodash");

const C = require("../../src/constants");

class GameRoom {
  constructor(code, io, preResolvedPromptPicker) {
    //TODO: Add game options
    this._code = code;
    this.isActive = true;
    this._io = io;
    // this._manager = manager;

    // this._countdownWillEnd = 0;
    this._adminKey = generateBase64Id(32);
    this._playerSockets = [];
    this._adminSockets = [];

    if (preResolvedPromptPicker) {
      this._promptPicker = preResolvedPromptPicker;
    } else {
      PromptPicker.CreateDefaultOnly()
        .then((promptPicker) => {
          this._promptPicker = promptPicker;
        })
        .catch((err) => {
          console.error("Prompt Picker Error");
        });
    }

    this._prompts = {};
    this._finalizedMatchupsToSend = [];

    this._currentVotingMatchup = {};
    this._currentVotingResults = {};
    this._currentScoringDetails = {};

    this._options = options.DEFAULT;
    this._currentRoundIndex = 0;

    this._pointTracker = null;

    this._currentTheme = getRandomTheme();

    this._timer = Timer.createDummy();
    this._inactiveTimeout = null;
    this.resetInactiveTimer();
    // Game state
    this._fsm();
  }

  static async CreateAsync(code, io) {
    return new GameRoom(code, io, await PromptPicker.CreateDefaultOnly());
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

  get currentRoundOptions() {
    return this._options.rounds[this._currentRoundIndex];
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
    this.resetInactiveTimer();
    this.sendThemeToIndividual(playerSocket);
    // Add to Player Sockets list
    this._playerSockets.push(playerSocket);

    // Update Player Info
    playerSocket.on("updateplayerinfo", (info) => {
      playerSocket.playerData.nickname = info.nickname.substring(
        0,
        C.MAX_NAME_CHARS
      );
      playerSocket.playerData.emoji = lodash.toArray(info.emoji)[0];
      this.sendPlayerDataToAll();
    });

    // Submit an answer to a prompt
    playerSocket.on("answerprompt", (data, ack) => {
      // console.log(`Received answer to ${data.promptId}: ${data.answer}`);
      this._prompts.answer(
        playerSocket.playerData.playerId,
        data.promptId,
        data.answer.substring(0, C.MAX_ANSWER_CHARS)
      );

      ack();

      this.emitYetToAnswer();
      // Double check state to narrow window of async issues
      // It might still be a problem
      // TODO add label to timer and check that when finishing
      if (this.state === "prompts" && this._prompts.areAllAnswered) {
        this._timer.finish();
      }
    });

    playerSocket.on("vote", (data, ack) => {
      const votingMode = this.currentRoundOptions.votingMode;
      // don't count from players who answered this prompt!

      // if (this._currentVotingMatchup.answers[data.index][0] !== data.playerId) {
      if (
        votingMode === C.VOTING_MODES.ANY ||
        // If in NOT_OWN_QUESTIONS mode, make sure player isn't on this prompt
        (votingMode === C.VOTING_MODES.NOT_OWN_QUESTIONS &&
          !this._currentVotingMatchup.players.includes(
            playerSocket.playerData.playerId
          )) ||
        // If in NOT_OWN_ANSWER mode, make sure player isn't voting for own answer
        (votingMode === C.VOTING_MODES.NOT_OWN_ANSWER &&
          this._currentVotingMatchup.answers[data.index][0] !==
            playerSocket.playerData.playerId)
      ) {
        ack();
        // console.log(`Counting vote from ${} for ${data.index}`);
        this._currentVotingResults[data.playerId] = data.index;
        // Check if everyone has voted
        let maxVotes = this._playerSockets.length;
        if (votingMode === C.VOTING_MODES.NOT_OWN_QUESTIONS) {
          maxVotes -= this.currentRoundOptions.answersPerPrompt;
        }
        if (
          this.state === "voting" &&
          Object.keys(this._currentVotingResults).length === maxVotes
        ) {
          this._timer.finish();
        }
      }
    });
  }

  emitYetToAnswer() {
    this.emitToAdmins("yettoanswer", {
      yetToAnswer: this._prompts.getUnfinishedPlayers(),
    });
  }

  addAdmin(adminSocket) {
    this.sendThemeToIndividual(adminSocket);
    adminSocket.on("startGame", (data) => {
      if (this.can("startGame")) {
        this.startGame();
      }
    });

    adminSocket.on("closeRoom", (data) => {
      this.closeRoom("closed by host");
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
      if (
        this.can("nextRound") &&
        this._currentRoundIndex < this._options.rounds.length - 1
      ) {
        this._timer.finish();
      }
    });

    adminSocket.on("skip", (data) => {
      if (!this._timer.completed) {
        this._timer.finish();
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

    adminSocket.on("loadcustomset", (data) => {
      console.log("Loading custom set", data.code);
      if (this.state === "lobby") {
        try {
          PromptPicker.CreateForCustomSet(data.code).then((promptPicker) => {
            this._promptPicker = promptPicker;
            this.sendCustomPromptStatus();
          });
        } catch (error) {
          console.error("Custom set doesn't exist");
        }
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
    this.sendOptionsToIndividual(playerSocket);
    this.sendThemeToIndividual(playerSocket);

    if (playerSocket && playerSocket.playerData.playerId) {
      this.sendStateToIndividual(playerSocket);
      if (this.state === "prompts") {
        this.sendUnansweredPromptsToPlayer(playerSocket);
        this.sendTimerToIndividualPlayer(playerSocket);
      } else if (this.state === "voting") {
        this.sendVotingOptionsToIndividualPlayer(playerSocket);
        this.sendTimerToIndividualPlayer(playerSocket);
      }
    }
  }

  get playerData() {
    return this._playerSockets.map((playerSocket) => {
      return playerSocket.playerData;
    });
  }

  createPromptRound() {
    this._prompts = new PromptRound(
      this.playerData,
      this.currentRoundOptions,
      this._promptPicker
    );
  }

  sendPromptsToPlayers() {
    for (let playerSocket of this._playerSockets) {
      this.sendUnansweredPromptsToPlayer(playerSocket);
    }
  }

  sendOptionsToAll() {
    this.emitToAll("gameoptions", {
      options: this._options,
      currentRoundIndex: this._currentRoundIndex,
    });
  }

  sendOptionsToIndividual(playerSocket) {
    playerSocket.emit("gameoptions", {
      options: this._options,
      currentRoundIndex: this._currentRoundIndex,
    });
  }

  sendCustomPromptStatus() {
    this.emitToAdmins(
      "custompromptstatus",
      this._promptPicker.customSetSummary
    );
  }

  sendPlayerDataToAll() {
    this.emitToAll("players", {
      players: this._playerSockets.map((socket) => socket.playerData),
    });
  }

  sendStateToAll() {
    this.emitToAll("state", this.stateSummary());
  }

  sendThemeToAll() {
    this.emitToAll("theme", this._currentTheme);
  }

  sendThemeToIndividual(socket) {
    socket.emit("theme", this._currentTheme);
  }

  sendStateToAdminsOnly() {
    this.emitToAdmins("state", this.stateSummary());
  }

  sendStateToIndividual(socket) {
    socket.emit("state", this.stateSummary());
  }

  emitToAll(event, data) {
    this._io.in(this._code).emit(event, data);
  }

  emitToAdmins(event, data) {
    this._io.in(adminRoom(this._code)).emit(event, data);
  }

  closeRoom(reason) {
    this._timer.cancel();
    this.isActive = false;
    this.emitToAll("closedRoom", {
      reason: reason,
    });
    this._playerSockets.forEach((socket) => {
      socket.disconnect(true); // true also closes underlying connection
    });
    this._adminSockets.forEach((socket) => {
      socket.disconnect(true);
    });
  }

  // Relevant parts of state and data combined for sending to clients
  stateSummary() {
    let state = {
      currentState: this.state,
    };
    return state;
  }

  prepareFinalizedMatchupsToSend() {
    this._finalizedMatchupsToSend = this._prompts.finalizeMatchups();
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

  sendVotingOptionsToIndividualPlayer(playerSocket) {
    playerSocket.emit("votingoptions", {
      currentVotingMatchup: this._currentVotingMatchup,
    });
  }

  createAndSendTimer(seconds, onCompleteFunction) {
    this._timer = Timer.createWithSeconds(seconds, onCompleteFunction);
    this.emitToAll("timer", this._timer.summary());
  }

  sendTimerToIndividualPlayer(playerSocket) {
    try {
      playerSocket.emit("timer", this._timer.summary());
    } catch (error) {
      console.log(error);
    }
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

  newTheme() {
    this._currentTheme = getRandomTheme();
    this.sendThemeToAll();
  }

  resetInactiveTimer() {
    clearTimeout(this._inactiveTimeout);
    this._inactiveTimeout = setTimeout(() => {
      this.closeRoom("timeout for inactivity");
    }, C.ROOM_PURGE_ACTIVITY_TIMEOUT_MS);
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
      this.resetInactiveTimer();
      this.sendStateToAll();
    },
    onStartGame: function () {
      this._currentRoundIndex = 0;
      this.initializePointTracker();
      console.log("Game Started");
    },
    onBeforeClosePrompts: function () {
      this.prepareFinalizedMatchupsToSend();
      console.log("closePrompts");
    },
    onPrompts: function () {
      console.log(
        `Starting round ${
          this._currentRoundIndex + 1
        } of prompts with options:`,
        this.currentRoundOptions
      );
      this.sendOptionsToAll();
      this.createPromptRound();
      this.sendPromptsToPlayers();
      this.emitYetToAnswer();

      // Time Limits
      this.createAndSendTimer(
        options.calculatePromptTimeForRound(
          this._options,
          this._currentRoundIndex
        ),
        () => {
          if (this.can("closePrompts")) {
            this.closePrompts();
          }
        }
      );
    },
    onVoting: function () {
      this._currentVotingResults = {};
      if (this._finalizedMatchupsToSend.length > 0) {
        this.sendNextFilledPromptToAdmin();
        this.sendVotingOptionsToPlayers();
        this.createAndSendTimer(
          options.calculateVotingTimeLimitForAnswers(
            this._options,
            this._currentVotingMatchup.answers.length
          ),
          () => {
            if (this.can("closeVoting")) {
              this.closeVoting();
            }
          }
        );
        console.log("initiateVoting");
      } else {
        this.closeVoting();
        this.endGame();
      }
    },
    onCloseVoting: function () {
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
        this.createAndSendTimer(this._options.promptResultDelay, () => {
          if (this.can("nextSet")) {
            this.nextSet();
          }
        });
      } else if (this._currentRoundIndex >= this._options.rounds.length - 1) {
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
    onBeforeNextRound: function () {
      this.newTheme();
      this._currentRoundIndex++;
      this._pointTracker.nextRound();
    },
    onEndGame: function () {
      this.emitToAdmins("scoreboarddata", {
        scoreboardData: this.calculateScoreboardData(),
      });
      console.log("endGame");
    },
    onBeforeNewGameSamePlayers: function () {
      this._currentRoundIndex = 0;
      this.sendCustomPromptStatus();
    },
    onBeforeNewGameNewPlayers: function () {
      this._currentRoundIndex = 0;
      this.sendCustomPromptStatus();
    },
  },
});

module.exports = GameRoom;
