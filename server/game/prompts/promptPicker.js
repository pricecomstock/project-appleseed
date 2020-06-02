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

// FIX WITH THIS
// https://stackoverflow.com/questions/20315434/node-js-asynchronous-module-loading
/* or maybe
if you export default prompts to its own module and access it through a function instead
but that still won't fix the fact that the real DB gets loaded after unit tests */
var defaultPromptsPromise = getAllDefaultPrompts();

class PromptPicker {
  constructor(defaultPrompts, customSet) {
    this._defaultPrompts = defaultPrompts;

    if (customSet) {
      this._customSetCode = customSet.metadata.id;
      this._customPrompts = customSet.prompts;
      this._customPromptSetData = customSet.metadata;
    } else {
      this._customSetCode = null;
      this._customPrompts = [];
      this._customPromptSetData = { name: "default", description: "" };
    }
  }

  static async CreateForCustomSet(customSetCode) {
    // Default set promise should resolve instantly after loading once
    let customSetPromise = getCustomSet(customSetCode);
    return new PromptPicker(
      await defaultPromptsPromise,
      await customSetPromise
    );
  }

  static async CreateDefaultOnly() {
    // Default set promise should resolve instantly after loading once
    return new PromptPicker(await defaultPromptsPromise, null);
  }

  get customSetSummary() {
    return {
      numRemaining: this._customPrompts.length,
      name: this._customPromptSetData.name,
      description: this._customPromptSetData.description,
      code: this._customSetCode,
    };
  }

  getRandomDefaultPrompts(count) {
    return randomItemsFromArrayWithoutRepeats(this._defaultPrompts);
  }

  getRandomDefaultPrompt() {
    return randomItemFromArray(this._defaultPrompts);
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
        ...this.getRandomDefaultPrompts(count - selected.length),
      ];
    }
    return selected;
  }

  getPrompt() {
    if (this._customPrompts.length > 0) {
      return popRandomItemFromArray(this._customPrompts);
    } else {
      return this.getRandomDefaultPrompt();
    }
  }
}

module.exports = {
  PromptPicker,
};
