const options = require("../../options");

const { optionSets } = options;

module.exports = {
  updateOptions: function (optionSetName) {
    const newOptions = optionSets.find(
      (optionSet) => optionSet.name === optionSetName
    );
    if (newOptions) {
      console.log("Updating Options", newOptions);
      this._options = newOptions;
      this.sendOptionsToAll();
    }
  },

  sendOptionSetsToAdmins: function () {
    console.log("Sending option sets");
    this.emitToAdmins("optionsets", optionSets);
  },
};
