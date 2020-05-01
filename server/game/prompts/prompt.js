const getPrompt = require("./sheetyPrompts");
const {
  getShuffledCopyOfArray,
  randomItemFromArray,
  randomItemsFromArrayWithoutRepeats,
  generateBase64Id,
} = require("../util");
// stackoverflow.com/questions/21295162/javascript-randomly-pair-items-from-array-without-repeats

const answersPerPromptOptions = {
  TWO: 2,
  ALL: "all",
};

class PromptMatchup {
  constructor(answeringPlayers, allPlayerNames) {
    this._players = answeringPlayers;
    // Insert any player names needed
    this._text = getPrompt()
      .replace(/_+/g, "______") // normalize blanks
      .replace(/%p/g, (match, offset, string) => {
        return `${randomItemFromArray(allPlayerNames)}`;
      });

    this._answers = new Map();

    // TODO guarantee no duplicates
    this._id = generateBase64Id(8);
  }

  answer(playerId, answer) {
    console.log(`${this._text}: ${playerId} submits "${answer}"`);
    this._answers.set(playerId, answer);
  }

  isAnsweredBy(playerId) {
    return this._answers.has(playerId);
  }

  get isAnsweredByAll() {
    return this._answers.size === this._players.length;
  }

  get id() {
    return this._id;
  }

  get text() {
    return this._text;
  }

  get players() {
    return this._players;
  }

  get sendable() {
    return {
      id: this._id,
      text: this._text,
      answers: [...this._answers],
    };
  }
}

class PromptRound {
  constructor(playerDatas, roundOptions) {
    this._roundOptions = roundOptions;

    this._playerNames = playerDatas.map((pd) => {
      return pd.emoji + pd.nickname;
    });
    this._playerIds = playerDatas.map((pd) => pd.playerId);

    this._matchups = new Map();
    this._promptsByPlayer = new Map();
    this._finalizedMatchups = [];

    this._numAnswersExpected =
      this._roundOptions.promptsPerPlayer * this._playerIds.length;
    this._numAnswersSubmitted = 0;

    this.createPromptMatchups();
  }

  answer(playerId, promptId, answer) {
    let matchup = this._matchups.get(promptId);
    if (!matchup.isAnsweredBy(playerId)) {
      // this shouldn't ever skip but just in case
      this._numAnswersSubmitted++;
    }
    matchup.answer(playerId, answer);
  }

  createPromptMatchups() {
    if (this._roundOptions.answersPerPrompt === answersPerPromptOptions.ALL) {
      this.createNewPromptForPlayers(this._playerIds); // All players
    } else {
      // An array where each index is the number of prompts still needed for each player
      let playerPool = Array(this._roundOptions.promptsPerPlayer + 1);
      playerPool.fill(
        (() => {
          // immediately exec function so these aren't all getting the same array
          // I don't know if this is necessary but oh well
          return [];
        })()
      );
      playerPool[this._roundOptions.promptsPerPlayer] = [...this._playerIds];

      let totalPromptsRemaining =
        (this._roundOptions.promptsPerPlayer * this._playerIds.length) /
        this._roundOptions.answersPerPrompt;

      let maxBucketNumber = this._roundOptions.promptsPerPlayer;
      let selectPlayers = () => {
        let playersInMaxBucket = playerPool[maxBucketNumber];
        // We evenly match remaining players that need max more prompts
        if (playersInMaxBucket.length === this._roundOptions.answersPerPrompt) {
          playerPool[maxBucketNumber - 1] = [
            // demote
            ...playerPool[maxBucketNumber - 1],
            ...playersInMaxBucket,
          ];
          playerPool[maxBucketNumber] = [];
          maxBucketNumber--; // move max bucket down
          return playersInMaxBucket; // return all players from max bucket
        } else if (
          playersInMaxBucket.length > this._roundOptions.answersPerPrompt
        ) {
          // We have extra players in this bucket still
          let selectedPlayers = randomItemsFromArrayWithoutRepeats(
            playersInMaxBucket,
            this._roundOptions.answersPerPrompt
          );
          // remove selected from top bucket
          playerPool[maxBucketNumber] = playersInMaxBucket.filter(
            (playerId) => {
              return !selectedPlayers.includes(playerId);
            }
          );
          // demote selected
          playerPool[maxBucketNumber - 1] = [
            ...playerPool[maxBucketNumber - 1],
            ...selectedPlayers,
          ];

          return selectedPlayers;
        } else {
          // Not enough players in bucket
          let selectedPlayers = playersInMaxBucket;
          let numPlayersStillNeeded =
            this._roundOptions.answersPerPrompt - selectedPlayers.length;

          let fromNextBucket = randomItemsFromArrayWithoutRepeats(
            playerPool[maxBucketNumber - 1],
            numPlayersStillNeeded
          );
          selectedPlayers = [...selectedPlayers, ...fromNextBucket];
          // demote players from next bucket into next-next bucket
          playerPool[maxBucketNumber - 2] = [
            ...playerPool[maxBucketNumber - 2],
            ...fromNextBucket,
          ];
          // remove selected from next bucket
          playerPool[maxBucketNumber - 1] = playerPool[
            maxBucketNumber - 1
          ].filter((playerId) => {
            return !fromNextBucket.includes(playerId);
          });

          // demote players from max bucket into next bucket
          playerPool[maxBucketNumber - 1] = [
            ...playerPool[maxBucketNumber - 1],
            ...playersInMaxBucket,
          ];
          // remove selected from top bucket
          playerPool[maxBucketNumber] = [];

          return selectedPlayers;
        }
      };

      while (totalPromptsRemaining > 0) {
        console.table(playerPool);
        let selectedPlayers = selectPlayers();
        console.log("Creating prompt for", selectedPlayers);
        totalPromptsRemaining--;

        this.createNewPromptForPlayers(selectedPlayers);
      }
    }
  }

  createNewPromptForPlayers(selectedPlayers) {
    const promptMatchup = new PromptMatchup(selectedPlayers, this._playerNames);

    selectedPlayers.forEach((playerId) => {
      let currentPrompts = this._promptsByPlayer.get(playerId);
      if (!currentPrompts) {
        currentPrompts = [];
        this._promptsByPlayer.set(playerId, currentPrompts);
      }
      currentPrompts.push(promptMatchup);
    });
    this._matchups.set(promptMatchup.id, promptMatchup);
  }

  getPromptsForPlayer(id) {
    return this._promptsByPlayer.get(id);
  }

  getUnansweredPromptsForPlayer(id) {
    let allPromptsForPlayer = this.getPromptsForPlayer(id);
    if (allPromptsForPlayer) {
      return allPromptsForPlayer.filter((promptMatchup) => {
        return !promptMatchup.isAnsweredBy(id);
      });
    } else {
      return [];
    }
  }

  get promptsByPlayer() {
    return this._promptsByPlayer;
  }

  get sendableMatchups() {
    return [...this._matchups.values()].map((matchup) => {
      return matchup.sendable;
    });
  }

  get areAllAnswered() {
    return this._numAnswersExpected === this._numAnswersSubmitted;
  }

  finalizeMatchups() {
    this._finalizedMatchups = getShuffledCopyOfArray(this.sendableMatchups);
    return this._finalizedMatchups;
  }
}

module.exports = { PromptRound, answersPerPromptOptions };
