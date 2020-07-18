const C = require("../../../src/constants");

const {
  STATE_MACHINE: { STATES: S, TRANSITIONS: T },
} = C;

const spec = {
  init: S.LOBBY,
  transitions: [
    { name: T.START_GAME, from: S.LOBBY, to: S.PROMPTS },
    { name: T.CLOSE_PROMPTS, from: S.PROMPTS, to: S.VOTING },
    { name: T.CLOSE_VOTING, from: S.VOTING, to: S.SCORING },
    { name: T.NEXT_SET, from: S.SCORING, to: S.VOTING },
    { name: T.END_ROUND, from: S.SCORING, to: S.END_OF_ROUND },
    { name: T.END_GAME, from: S.SCORING, to: S.FINAL_SCORES },
    { name: T.NEXT_ROUND, from: S.END_OF_ROUND, to: S.PROMPTS },
    { name: T.NEW_GAME_NEW_PLAYERS, from: S.FINAL_SCORES, to: S.LOBBY },
    { name: T.NEW_GAME_SAME_PLAYERS, from: S.FINAL_SCORES, to: S.PROMPTS },
  ],
};

module.exports = spec;
