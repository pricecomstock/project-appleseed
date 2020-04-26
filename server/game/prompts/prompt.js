const getPrompt = require("./sheetyPrompts");
const { getShuffledCopyOfArray, generateBase64Id } = require("../util");
// stackoverflow.com/questions/21295162/javascript-randomly-pair-items-from-array-without-repeats

class PromptMatchup {
  constructor(text, players) {
    this._players = players;
    this._text = text;
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

class PromptSet {
  constructor(playerIds) {
    this.PROMPTS_PER_PLAYER = 2;
    this.PLAYERS_PER_PROMPT = 2;
    this._playerIds = playerIds;

    this._matchups = new Map();
    this._promptsByPlayer = new Map();
    this._finalizedMatchups = [];

    this.createPromptMatchups();
  }

  answer(playerId, promptId, answer) {
    this._matchups.get(promptId).answer(playerId, answer);
  }

  createPromptMatchups() {
    let playerLists = [];
    // step 1, create random lists of players.
    // Players will be in lists n times to answer n prompts
    // There will be m lists, where each prompt is answered by m players
    for (let i = 0; i < this.PLAYERS_PER_PROMPT; i++) {
      let shuffledPlayers = [];
      // Notice - 1 because everyone will be in 2 by default
      for (let j = 0; j < this.PROMPTS_PER_PLAYER - 1; j++) {
        shuffledPlayers = shuffledPlayers.concat(
          getShuffledCopyOfArray(this._playerIds)
        );
      }
      playerLists.push(shuffledPlayers);
    }
    console.log(playerLists);

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

      const promptMatchup = new PromptMatchup(getPrompt(), selectedPlayers);
      // console.log("Matchup: ", promptMatchup);
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
  }

  getPromptsForPlayer(id) {
    return this._promptsByPlayer.get(id);
  }

  getUnansweredPromptsForPlayer(id) {
    return this.getPromptsForPlayer(id).filter((promptMatchup) => {
      return !promptMatchup.isAnsweredBy(id);
    });
  }

  get promptsByPlayer() {
    return this._promptsByPlayer;
  }

  get sendableMatchups() {
    return [...this._matchups.values()].map((matchup) => {
      return matchup.sendable;
    });
  }

  finalizeMatchups() {
    this._finalizedMatchups = getShuffledCopyOfArray(this.sendableMatchups);
    return this._finalizedMatchups;
  }
}

module.exports = { PromptSet };
