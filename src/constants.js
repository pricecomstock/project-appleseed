const C = {
  SOCKET_TIMEOUT_MS: 600000, // 10 minutes
  ROOM_PURGE_INTERVAL_MS: 60000, // 1 minute
  ROOM_PURGE_ACTIVITY_TIMEOUT_MS: 600000, // 10 minutes,

  TIMER_COUNTDOWN_INTERVAL: 30,
  TIMER_SAFETY_BUFFER: 1000,

  MAX_CUSTOM_SET_NAME_CHARS: 30, // Also have to migrate DB
  MAX_CUSTOM_SET_DESCRIPTION_CHARS: 255, // Also have to migrate DB

  MAX_PROMPT_CHARS: 140,
  MAX_ANSWER_CHARS: 60,
  MAX_NAME_CHARS: 14,

  VOTING_MODES: {
    NOT_OWN_QUESTIONS: "not own questions", // can't vote for own prompts
    NOT_OWN_ANSWER: "not own answer", // can vote for other answers on own prompts
    ANY: "any", // can vote for any answer
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
};

module.exports = C;
