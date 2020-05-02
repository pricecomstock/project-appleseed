const {
  getAllDefaultPrompts,
  getAllPromptsFromCustomSet,
} = require("../../promptdb/promptdb");
const { randomItemsFromArrayWithoutRepeats } = require("../util");

var defaultPrompts = [];

getAllDefaultPrompts()
  .then((prompts) => {
    defaultPrompts = prompts;
  })
  .catch((err) => {
    console.error("Uh oh, something went wrong loading the prompt DB");
  });

function getRandomDefaultPrompts(count) {
  return randomItemsFromArrayWithoutRepeats(defaultPrompts);
}

class PromptPicker {
  constructor(customSetCode) {
    this._customSetCode = customSetCode;
    this._customPrompts = [];
    getAllPromptsFromCustomSet(this._customSetCode).then((prompts) => {
      this._customPrompts = prompts;
    });
  }

  getPrompts(count) {
    let selected = [];
    if (count <= this._customPrompts.length) {
      // we have enough custom prompts
      selected = randomItemsFromArrayWithoutRepeats(this._customPrompts, count);
      this._customPrompts = this._customPrompts.filter();
    } else {
      // select all custom prompts
      selected = this._customPrompts;
      // fill the rest with default prompts
      selected = [
        ...selected,
        ...getRandomDefaultPrompts(count - selected.length),
      ];
    }
    return selected;
  }
}

module.exports = {
  getRandomDefaultPrompts,
  PromptPicker,
};
