const getPrompt = require("./testPrompts");
const { getShuffledCopyOfArray, generateBase64Id } = require("../util");
// stackoverflow.com/questions/21295162/javascript-randomly-pair-items-from-array-without-repeats

class PromptMatchup {
  constructor(text, players) {
    this._players = players;
    this._text = text;
    this._id = generateBase64Id(12);
  }

  get id() {
    return this._id;
  }

  get text() {
    return this._text;
  }
}

class PromptSet {
  constructor(playerIds) {
    this.PROMPTS_PER_PLAYER = 2;
    this.PLAYERS_PER_PROMPT = 2;
    this._playerIds = playerIds;

    this._matchups = [];
    this._promptsByPlayer = new Map();
    createPromptMatchups(playerIds);
  }

  createPromptMatchups() {
    playerLists = [];
    // step 1, create random lists of players.
    // Players will be in lists n times to answer n prompts
    // There will be m lists, where each prompt is answered by m players
    for (let i = 0; i < this.PLAYERS_PER_PROMPT; i++) {
      let shuffledPlayers = [];
      for (let j = 0; j < this.PROMPTS_PER_PLAYER; j++) {
        shuffledPlayers.push(getShuffledCopyOfArray(this._playerIds));
      }
      playerLists.push(shuffledPlayers);
    }

    // Step 2 pull items off each list
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
      selectedPlayers.forEach((playerId) => {
        let currentPrompts = this._promptsByPlayer.get(playerId);
        // FIXME i think since arrays are by reference this will work
        currentPrompts.push(promptMatchup.text);
      });
      this._matchups.push(promptMatchup);
    }
  }

  getPromptsForPlayer(id) {
    return this._promptsByPlayer.get(id);
  }
}

module.exports = { Prompt, PromptSet };
