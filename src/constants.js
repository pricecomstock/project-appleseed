const C = {
  SOCKET_TIMEOUT_MS: 600000, // 10 minutes
  ROOM_PURGE_INTERVAL_MS: 60000, // 1 minute
  ROOM_PURGE_ACTIVITY_TIMEOUT_MS: 600000, // 10 minutes,

  TIMER_COUNTDOWN_INTERVAL: 30,
  TIMER_SAFETY_BUFFER: 1000,

  MAX_CUSTOM_SET_NAME_CHARS: 30, // Also have to migrate DB
  MAX_CUSTOM_SET_DESCRIPTION_CHARS: 255, // Also have to migrate DB

  MAX_PROMPT_CHARS: 140,
  MAX_ANSWER_CHARS: 70,
  MAX_NAME_CHARS: 14,

  VOTING_MODES: {
    NOT_OWN_QUESTIONS: "not own questions", // can't vote for own prompts
    NOT_OWN_ANSWER: "not own answer", // can vote for other answers on own prompts
    ANY: "any", // can vote for any answer
  },

  ANSWERS_PER_PROMPT_OPTIONS: {
    THREE: 3,
    TWO: 2,
    ALL: "all",
  },

  DEFAULT_VOLUME: 0.6,

  DEFAULT_THEME: {
    backgroundStyles: {
      backgroundColor: "#777",
      color: "#666",
    },
    textColor: "white",
    backgroundClasses: "pattern-diagonal-stripes-xl",
  },

  STATE_MACHINE: {
    STATES: {
      LOBBY: "lobby",
      PROMPTS: "prompts",
      VOTING: "voting",
      SCORING: "scoring",
      END_OF_ROUND: "endOfRound",
      FINAL_SCORES: "finalScores",
    },
    TRANSITIONS: {
      START_GAME: "startGame",
      CLOSE_PROMPTS: "closePrompts",
      CLOSE_VOTING: "closeVoting",
      NEXT_SET: "nextSet",
      END_ROUND: "endRound",
      END_GAME: "endGame",
      NEXT_ROUND: "nextRound",
      NEW_GAME_NEW_PLAYERS: "newGameNewPlayers",
      NEW_GAME_SAME_PLAYERS: "newGameSamePlayers",
    },
  },
};

module.exports = C;
