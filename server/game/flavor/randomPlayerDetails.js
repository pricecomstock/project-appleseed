const { randomItemFromArray } = require("../util");

function randomEmoji() {
  const possibleEmoji = [
    "😾",
    "😈",
    "🙈",
    "⛄",
    "⚡",
    "🌈",
    "🍑",
    "🥑",
    "🌯",
    "🌭",
    "🌵",
    "🏈",
    "📀",
    "🗿",
    "💾",
    "💸",
    "💙",
    "🍞",
    "🍕",
    "🍼",
    "💩",
    "👽",
    "⭐",
    "🍄",
  ];
  return randomItemFromArray(possibleEmoji);
}

function randomPlayerName() {
  const adjectives = [
    "green",
    "slimy",
    "fresh",
    "quality",
    "rosy",
    "eerie",
    "giant",
    "kind",
    "patient",
  ];

  const nouns = [
    "rhino",
    "couch",
    "spider",
    "rain",
    "camera",
    "lamp",
    "board",
    "skater",
    "dog",
    "cat",
    "ladder",
    "doctor",
  ];

  return `${randomItemFromArray(adjectives)} ${randomItemFromArray(nouns)}`;
}

module.exports = {
  randomEmoji,
  randomPlayerName,
};
