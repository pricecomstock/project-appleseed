const { getRandomTheme } = require("../../flavor/themes");

module.exports = {
  newTheme: function () {
    console.log("A theme!");
    this._currentTheme = getRandomTheme();
    this.sendThemeToAll();
  },
};
