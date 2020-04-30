const getPrompt = require("./sheetyPrompts");
const {
  getShuffledCopyOfArray,
  randomItemFromArray,
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
      let playerLists = [];
      // step 1, create random lists of players.
      // Players will be in lists n times to answer n prompts
      // There will be m lists, where each prompt is answered by m players
      for (let i = 0; i < this._roundOptions.answersPerPrompt; i++) {
        let shuffledPlayers = [];
        // Notice - 1 because everyone will be in 2 by default
        for (let j = 0; j < this._roundOptions.promptsPerPlayer - 1; j++) {
          shuffledPlayers = shuffledPlayers.concat(
            getShuffledCopyOfArray(this._playerIds)
          );
        }
        playerLists.push(shuffledPlayers);
      }
      // console.log(playerLists);

      // Step 2 pull items off each list
      // console.log("Prompt shuffled player lists: ", playerLists);
      while (playerLists[0].length > 0) {
        let selectedPlayers = [];

        // Pick a player from each random list
        playerLists.forEach((playerList) => {
          // Grab first player who isn't already selected
          for (let i = 0; i < playerList.length; i++) {
            const player = playerList[i];
            if (!selectedPlayers.includes(player)) {
              // Remove player from playerList and put in selected
              // Splice returns array, so we pull item out with [0]
              selectedPlayers.push(playerList.splice(i, 1)[0]);
              break;
            }
          }
        });
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
