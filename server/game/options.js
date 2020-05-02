const { answersPerPromptOptions } = require("./prompts/prompt");

const defaultOptions = {
  maxPlayers: 16,

  pointsPerPrompt: 6000,
  pointsForShutout: 1000,

  rounds: [
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.TWO,
      pointMultiplier: 1,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.TWO,
      pointMultiplier: 2,
    },
    {
      promptsPerPlayer: 1,
      answersPerPrompt: answersPerPromptOptions.ALL,
      pointMultiplier: 4,
    },
  ],

  promptTimeLimit: 90,
  votingTimeLimit: 25,
  promptResultDelay: 7,
  roundDelay: 12,
  selfVoting: false,
};

module.exports = { DEFAULT: defaultOptions };
