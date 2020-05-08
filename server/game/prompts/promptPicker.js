const {
  getAllDefaultPrompts,
  getCustomSet,
} = require("../../promptdb/promptdb");
const {
  randomItemsFromArrayWithoutRepeats,
  popRandomItemsFromArrayWithoutRepeats,
  randomItemFromArray,
  popRandomItemFromArray,
} = require("../util");

var defaultPrompts = [];

getAllDefaultPrompts()
  .then((prompts) => {
    defaultPrompts = prompts;
    console.log(`Loaded ${prompts.length} default prompts`);
  })
  .catch((err) => {
    console.error("Uh oh, something went wrong loading the prompt DB");
  });

function getRandomDefaultPrompts(count) {
  return randomItemsFromArrayWithoutRepeats(defaultPrompts);
}

function getRandomDefaultPrompt() {
  return randomItemFromArray(defaultPrompts);
}

class PromptPicker {
  constructor(useCustomSet, customSetCode, customSetLoadedCallback) {
    if (useCustomSet) {
      this._customSetCode = customSetCode;
      getCustomSet(this._customSetCode)
        .then((customSet) => {
          this._customPrompts = customSet.prompts;
          this._customPromptSetData = customSet.metadata;
          customSetLoadedCallback();
        })
        .catch((err) => console.error(err));
    } else {
      this._customSetCode = null;
      this._customPrompts = [];
      this._customPromptSetData = { name: "default", description: "" };
    }
  }

  static CreateForCustomSet(customSetCode, customSetLoadedCallback) {
    return new PromptPicker(true, customSetCode, customSetLoadedCallback);
  }

  get customSetSummary() {
    return {
      numRemaining: this._customPrompts.length,
      name: this._customPromptSetData.name,
      description: this._customPromptSetData.description,
      code: this._customSetCode,
    };
  }

  getPrompts(count) {
    let selected = [];
    if (count <= this._customPrompts.length) {
      // we have enough custom prompts
      selected = popRandomItemsFromArrayWithoutRepeats(
        this._customPrompts,
        count
      );
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

  getPrompt() {
    if (this._customPrompts.length > 0) {
      return popRandomItemFromArray(this._customPrompts);
    } else {
      return getRandomDefaultPrompt();
    }
  }
}

module.exports = {
  getRandomDefaultPrompt,
  getRandomDefaultPrompts,
  PromptPicker,
};
