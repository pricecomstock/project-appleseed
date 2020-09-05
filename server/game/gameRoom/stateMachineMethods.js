import C from "../../../src/constants";
const {
  STATE_MACHINE: { TRANSITIONS },
} = C;
const options = require("../options");

module.exports = {
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
  },
  onPrompts: function () {
    console.log(
      `Starting round ${this._currentRoundIndex + 1} of prompts with options:`,
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
        if (this.can(TRANSITIONS.CLOSE_PROMPTS)) {
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
          if (this.can(TRANSITIONS.CLOSE_VOTING)) {
            this.closeVoting();
          }
        }
      );
    } else {
      this.closeVoting();
      this.endGame();
    }
  },
  onCloseVoting: function () {},
  onScoring: function () {
    this.processVotingPoints();
    this.emitToAdmins("votingresults", {
      votingResults: this._currentVotingResults,
      scoringDetails: this._currentScoringDetails,
    });

    if (this._finalizedMatchupsToSend.length > 0) {
      // More answers to read
      this.createAndSendTimer(this._options.promptResultDelay, () => {
        if (this.can(TRANSITIONS.NEXT_SET)) {
          this.nextSet();
        }
      });
    } else if (this._currentRoundIndex >= this._options.rounds.length - 1) {
      // No more answers, no more rounds
      this.createAndSendTimer(this._options.roundDelay, () => {
        if (this.can(TRANSITIONS.END_GAME)) {
          this.endGame();
        }
      });
    } else {
      // No more answers, but anther round
      this.createAndSendTimer(this._options.roundDelay, () => {
        if (this.can(TRANSITIONS.END_ROUND)) {
          this.endRound();
        }
      });
    }
  },
  onNextSet: function () {},
  onEndOfRound: function () {
    // on enter the state
    this.createAndSendTimer(this._options.roundDelay, () => {
      if (this.can(TRANSITIONS.NEXT_ROUND)) {
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
  },
  onBeforeNewGameSamePlayers: function () {
    this._currentRoundIndex = 0;
    this.sendCustomPromptStatus();
  },
  onBeforeNewGameNewPlayers: function () {
    this._currentRoundIndex = 0;
    this.sendCustomPromptStatus();
  },
};
