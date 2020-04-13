const prompts = [
  "AAAA",
  "BBBB",
  "CCCC",
  "DDDD",
  "EEEE",
  "FFFF",
  "GGGG",
  "HHHH",
  "IIII",
  "JJJJ",
  "KKKK",
  "LLLL",
  "MMMM",
  "NNNN",
  "OOOO",
  "PPPP",
  "QQQQ",
  "RRRR",
  "SSSS",
  "TTTT",
  "UUUU",
  "VVVV",
  "WWWW",
  "XXXX",
  "YYYY",
  "ZZZZ",
];

function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

module.exports = getRandomPrompt;
