const C = require("../../src/constants");

const votingModes = C.VOTING_MODES;
const answersPerPromptOptions = C.ANSWERS_PER_PROMPT_OPTIONS;

function calculatePromptTimeForRound(options, roundIndex) {
  return (
    options.promptTimeLimitBase +
    options.rounds[roundIndex].promptsPerPlayer *
      options.promptBonusTimePerPrompt
  );
}

function calculateVotingTimeLimitForAnswers(options, numAnswers) {
  return (
    options.votingTimeLimitBase + numAnswers * options.votingBonusTimePerAnswer
  );
}

const defaultOptions = {
  maxPlayers: 16,

  pointsPerPrompt: 6000,
  pointsForWin: 1000,
  pointsForShutout: 1000,

  rounds: [
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.TWO,
      pointMultiplier: 1,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.TWO,
      pointMultiplier: 2,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 1,
      answersPerPrompt: answersPerPromptOptions.ALL,
      pointMultiplier: 4,
      votingMode: votingModes.NOT_OWN_ANSWER,
    },
  ],

  promptTimeLimitBase: 50,
  promptBonusTimePerPrompt: 20,
  votingTimeLimitBase: 19,
  votingBonusTimePerAnswer: 3,
  promptResultDelay: 7,
  roundDelay: 12,
};

const quickWitsOptions = {
  maxPlayers: 16,

  pointsPerPrompt: 6000,
  pointsForWin: 1000,
  pointsForShutout: 1000,

  rounds: [
    {
      promptsPerPlayer: 3,
      answersPerPrompt: answersPerPromptOptions.TWO,
      pointMultiplier: 1,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.ALL,
      pointMultiplier: 2,
      votingMode: votingModes.NOT_OWN_ANSWER,
    },
  ],

  promptTimeLimitBase: 40,
  promptBonusTimePerPrompt: 18,
  votingTimeLimitBase: 15,
  votingBonusTimePerAnswer: 4,
  promptResultDelay: 7,
  roundDelay: 12,
};

const tritWitsOptions = {
  maxPlayers: 12,

  pointsPerPrompt: 6000,
  pointsForWin: 1500,
  pointsForShutout: 2000,

  rounds: [
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.THREE,
      pointMultiplier: 1,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.THREE,
      pointMultiplier: 2,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.ALL,
      pointMultiplier: 4,
      votingMode: votingModes.NOT_OWN_ANSWER,
    },
  ],

  promptTimeLimitBase: 50,
  promptBonusTimePerPrompt: 20,
  votingTimeLimitBase: 19,
  votingBonusTimePerAnswer: 3,
  promptResultDelay: 7,
  roundDelay: 12,
};

const allInOptions = {
  maxPlayers: 16,

  pointsPerPrompt: 12000,
  pointsForWin: 2500,
  pointsForShutout: 5000,

  rounds: [
    {
      promptsPerPlayer: 4,
      answersPerPrompt: answersPerPromptOptions.ALL,
      pointMultiplier: 1,
      votingMode: votingModes.NOT_OWN_ANSWER,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: answersPerPromptOptions.ALL,
      pointMultiplier: 2,
      votingMode: votingModes.NOT_OWN_ANSWER,
    },
  ],

  promptTimeLimitBase: 50,
  promptBonusTimePerPrompt: 20,
  votingTimeLimitBase: 19,
  votingBonusTimePerAnswer: 3,
  promptResultDelay: 12,
  roundDelay: 12,
};

// TODO split the functions into a different file from the option sets
module.exports = {
  calculatePromptTimeForRound,
  calculateVotingTimeLimitForAnswers,
  DEFAULT: defaultOptions,
  QUICKWITS: quickWitsOptions,
  TRITWITS: tritWitsOptions,
  ALL_IN: allInOptions,
};
