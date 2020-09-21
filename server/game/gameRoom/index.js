const { generateBase64Id, adminRoom, bindMethods } = require("../util");
const StateMachine = require("javascript-state-machine");
const { PromptRound } = require("../prompts/prompt");
const { PromptPicker } = require("../prompts/promptPicker");
const { getRandomTheme } = require("../flavor/themes");
const options = require("../options");
const PointTracker = require("../pointTracker");
const Timer = require("../timer");
const lodash = require("lodash");

const C = require("../../../src/constants");

const {
  STATE_MACHINE: { STATES, TRANSITIONS },
} = C;

const stateMachineSpec = require("./stateMachineSpec");
const stateMachineMethods = require("./stateMachineMethods");

const themeMethods = require("./methods/theme");
const optionsMethods = require("./methods/options");

class GameRoom {
  constructor(code, io, preResolvedPromptPicker) {
    //TODO: Add game options
    this._code = code;
    this.createdTime = Date.now();
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

    // Import methods from other files
    bindMethods(themeMethods, this);
    bindMethods(optionsMethods, this);
  }

  static async CreateAsync(code, io) {
    return new GameRoom(code, io, await PromptPicker.CreateDefaultOnly());
  }

  initializePointTracker() {
    this._pointTracker = new PointTracker(this.playerData, this._options);
  }

  get summaryForStats() {
    return {
      state: this.state,
      playerCount: this._playerSockets.length,
      age: (Date.now() - this.createdTime) / 1000,
    };
  }

  get adminKey() {
    return this._adminKey;
  }

  get code() {
    return this._code;
  }

  get currentRoundOptions() {
    try {
      return this._options.rounds[this._currentRoundIndex];
    } catch (Error) {
      return this._options.rounds[0]; // this is a bad bug fix
    }
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
      this.state === STATES.LOBBY &&
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

    playerSocket.emit("playerIdAssigned", playerSocket.playerData);
    this.givePlayerCurrentInfo(playerSocket);
    this.sendPlayerDataToAll();
    this.sendStateToAll();
    playerSocket.emit("openEditPlayerInfoForm");

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
      if (this.state === STATES.PROMPTS && this._prompts.areAllAnswered) {
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
          this.state === STATES.VOTING &&
          Object.keys(this._currentVotingResults).length === maxVotes
        ) {
          this._timer.finish();
        }
      }
    });
  }

  removePlayer(playerSocket) {
    this.resetInactiveTimer();
    let socketIndex = this._playerSockets.indexOf(playerSocket);
    if (socketIndex !== -1) {
      this._playerSockets.splice(socketIndex, 1);

      playerSocket.emit("kick");
      playerSocket.disconnect(true);
    }
  }

  emitYetToAnswer() {
    this.emitToAdmins("yettoanswer", {
      yetToAnswer: this._prompts.getUnfinishedPlayers(),
    });
  }

  addAdmin(adminSocket) {
    this.giveAdminCurrentInfo(adminSocket);
    adminSocket.on(TRANSITIONS.START_GAME, (data) => {
      if (this.can(TRANSITIONS.START_GAME)) {
        try {
          this.startGame();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on("closeRoom", (data) => {
      this.closeRoom("closed by host");
    });

    adminSocket.on(TRANSITIONS.CLOSE_PROMPTS, (data) => {
      if (this.can(TRANSITIONS.CLOSE_PROMPTS)) {
        try {
          this._timer.cancel();
          this.closePrompts();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.CLOSE_VOTING, (data) => {
      if (this.can(TRANSITIONS.CLOSE_VOTING)) {
        try {
          this._timer.cancel();
          this.closeVoting();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.NEXT_SET, (data) => {
      if (
        this.can(TRANSITIONS.NEXT_SET) &&
        this._finalizedMatchupsToSend.length > 0
      ) {
        try {
          this._timer.cancel();
          this.nextSet();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.END_ROUND, (data) => {
      if (this.can(TRANSITIONS.END_ROUND)) {
        try {
          this._timer.cancel();
          this.endRound();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.END_GAME, (data) => {
      if (this.can(TRANSITIONS.END_GAME)) {
        try {
          this._timer.cancel();
          this.endGame();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.NEXT_ROUND, (data) => {
      if (
        this.can(TRANSITIONS.NEXT_ROUND) &&
        this._currentRoundIndex < this._options.rounds.length - 1
      ) {
        try {
          this._timer.finish();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on("skip", (data) => {
      if (!this._timer.completed) {
        try {
          this._timer.finish();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.NEW_GAME_NEW_PLAYERS, (data) => {
      if (this.can(TRANSITIONS.NEW_GAME_NEW_PLAYERS)) {
        try {
          this._timer.cancel();
          this.newGameNewPlayers();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on(TRANSITIONS.NEW_GAME_SAME_PLAYERS, (data) => {
      if (this.can(TRANSITIONS.NEW_GAME_SAME_PLAYERS)) {
        try {
          this._timer.cancel();
          this.newGameSamePlayers();
        } catch (error) {
          console.error(error);
        }
      }
    });

    adminSocket.on("loadcustomset", (data) => {
      console.log("Loading custom set", data.code);
      if (this.state === STATES.LOBBY) {
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

    adminSocket.on("updateOptions", (data) => {
      const { name } = data;
      // FIXME literals ugh
      if (["DEFAULT", "QUICKWITS", "TRITWITS", "ALL_IN"].includes(name)) {
        const newOptions = options[name];
        this.updateOptions(newOptions);
      }
    });

    adminSocket.on("kickplayer", (data) => {
      if (this.state === STATES.LOBBY) {
        const { playerId } = data;
        const socketToRemove = this.getPlayerSocketWithId(playerId);

        this.removePlayer(socketToRemove);
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

  giveAdminCurrentInfo(adminSocket) {
    // For reconnects
    this.sendOptionsToIndividual(adminSocket);
    this.sendThemeToIndividual(adminSocket);

    this.sendStateToIndividual(adminSocket);
    this.sendTimerToIndividual(adminSocket);
    this.sendCurrentMatchupToAdmins();
  }

  givePlayerCurrentInfo(playerSocket) {
    // For reconnects
    this.sendOptionsToIndividual(playerSocket);
    this.sendThemeToIndividual(playerSocket);

    if (playerSocket && playerSocket.playerData.playerId) {
      this.sendStateToIndividual(playerSocket);
      if (this.state === STATES.PROMPTS) {
        this.sendUnansweredPromptsToPlayer(playerSocket);
        this.sendTimerToIndividual(playerSocket);
      } else if (this.state === STATES.VOTING) {
        this.sendVotingOptionsToIndividualPlayer(playerSocket);
        this.sendTimerToIndividual(playerSocket);
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

  sendOptionsToIndividual(socket) {
    socket.emit("gameoptions", {
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
    this.sendCurrentMatchupToAdmins();
  }

  sendCurrentMatchupToAdmins() {
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

  sendTimerToIndividual(socket) {
    try {
      socket.emit("timer", this._timer.summary());
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

  resetInactiveTimer() {
    clearTimeout(this._inactiveTimeout);
    this._inactiveTimeout = setTimeout(() => {
      this.closeRoom("timeout for inactivity");
    }, C.ROOM_PURGE_ACTIVITY_TIMEOUT_MS);
  }
}

StateMachine.factory(GameRoom, {
  ...stateMachineSpec,
  methods: stateMachineMethods,
});

module.exports = GameRoom;
