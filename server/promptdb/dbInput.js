const C = require("../../src/constants");
const promptdb = require("./promptdb");

function generateCustomSetId() {
  const codeLength = 16;
  const validCharacters = "ABCDEFHJLMNOPQRSTVWXYZ";

  let code = "";
  for (let i = 0; i < codeLength; i++) {
    code += validCharacters[Math.floor(Math.random() * validCharacters.length)];
  }

  return code;
}

function convertPromptTextToArrayAndNormalize(promptText) {
  // Condense spaces and underscores right away
  let promptArray = promptText
    .replace(/ +/g, " ")
    .replace(/_+/g, "_")
    .split("\n");

  // Filter prompts that are empty or too long
  promptArray = promptArray.filter((prompt) => {
    return (
      // blank or only whitespace
      prompt.replace(/\s+/g, "").length > 0 &&
      // discard too long of prompts
      prompt.length <= C.MAX_PROMPT_CHARS
    );
  });

  return promptArray;
}

async function createCustomPromptSetFromText(name, description, promptText) {
  let cleanName = name || "";
  let cleanDesc = description || "";
  cleanName = name.slice(0, C.MAX_CUSTOM_SET_NAME_CHARS);
  cleanDesc = description.slice(0, C.MAX_CUSTOM_SET_NAME_CHARS);
  let promptArray = convertPromptTextToArrayAndNormalize(promptText);
  return await promptdb.createCustomSet(cleanName, cleanDesc, promptArray);
}

module.exports = {
  createCustomPromptSetFromText,
};
