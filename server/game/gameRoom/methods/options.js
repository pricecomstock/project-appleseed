const options = require("../../options");

module.exports = {
  updateOptions: function (newOptions) {
    console.log("Updating Options", newOptions);
    this._options = newOptions;
    this.sendOptionsToAll();
  },
};
