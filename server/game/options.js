const { answersPerPromptOptions } = require("./prompts/prompt");
const C = require("../../src/constants");

const votingModes = C.VOTING_MODES;

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
  pointsForShutout: 1000,

  rounds: [
    {
      promptsPerPlayer: 2,
      answersPerPrompt: C.ANSWERS_PER_PROMPT_OPTIONS.TWO,
      pointMultiplier: 1,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 2,
      answersPerPrompt: C.ANSWERS_PER_PROMPT_OPTIONS.TWO,
      pointMultiplier: 2,
      votingMode: votingModes.NOT_OWN_QUESTIONS,
    },
    {
      promptsPerPlayer: 1,
      answersPerPrompt: C.ANSWERS_PER_PROMPT_OPTIONS.ALL,
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

module.exports = {
  calculatePromptTimeForRound,
  calculateVotingTimeLimitForAnswers,
  DEFAULT: defaultOptions,
};
