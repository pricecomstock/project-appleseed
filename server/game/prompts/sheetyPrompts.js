const fs = require("fs");

const sheetyFileName = "./server/game/prompts/sheety.json";

const promptJson = fs.readFileSync(sheetyFileName);
const prompts = JSON.parse(promptJson).prompts;

function getRandomPrompt() {
  return prompts[Math.floor(Math.random() * prompts.length)];
}

module.exports = getRandomPrompt;
