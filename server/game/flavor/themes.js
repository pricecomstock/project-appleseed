const { randomItemFromArray } = require("../util");

const backgroundClassNames = [
  "pattern-checks-sm",
  "pattern-checks-md",
  "pattern-checks-lg",
  "pattern-checks-xl",
  "pattern-grid-sm",
  "pattern-grid-md",
  "pattern-grid-lg",
  "pattern-grid-xl",
  "pattern-dots-sm",
  "pattern-dots-md",
  "pattern-dots-lg",
  "pattern-dots-xl",
  "pattern-cross-dots-sm",
  "pattern-cross-dots-md",
  "pattern-cross-dots-lg",
  "pattern-cross-dots-xl",
  "pattern-diagonal-lines-sm",
  "pattern-diagonal-lines-md",
  "pattern-diagonal-lines-lg",
  "pattern-diagonal-lines-xl",
  "pattern-horizontal-lines-sm",
  "pattern-horizontal-lines-md",
  "pattern-horizontal-lines-lg",
  "pattern-horizontal-lines-xl",
  "pattern-vertical-lines-sm",
  "pattern-vertical-lines-md",
  "pattern-vertical-lines-lg",
  "pattern-vertical-lines-xl",
  "pattern-diagonal-stripes-sm",
  "pattern-diagonal-stripes-md",
  "pattern-diagonal-stripes-lg",
  "pattern-diagonal-stripes-xl",
  "pattern-horizontal-stripes-sm",
  "pattern-horizontal-stripes-md",
  "pattern-horizontal-stripes-lg",
  "pattern-horizontal-stripes-xl",
  "pattern-vertical-stripes-sm",
  "pattern-vertical-stripes-md",
  "pattern-vertical-stripes-lg",
  "pattern-vertical-stripes-xl",
  "pattern-triangles-sm",
  "pattern-triangles-md",
  "pattern-triangles-lg",
  "pattern-triangles-xl",
  "pattern-zigzag-sm",
  "pattern-zigzag-md",
  "pattern-zigzag-lg",
  "pattern-zigzag-xl",
];
const colorSets = [];

function createColorSet(bgColor1, bgColor2, fgColor) {
  if (!fgColor) {
    // TODO calculate based on background colors
    fgColor = "#ffffff";
  }
  return { bgColor1, bgColor2, fgColor };
}

function generateThemeFromColorset(colorSet) {
  return {
    backgroundStyles: {
      "background-color": colorSet.bgColor1,
      color: colorSet.bgColor2,
    },
    textColor: colorSet.fgColor,
    backgroundClasses: randomItemFromArray(backgroundClassNames),
  };
}

colorSets.push(createColorSet("#9d0208", "#d00000"));
colorSets.push(createColorSet("#e56b6f", "#6d597a"));

function getRandomTheme() {
  let theme = generateThemeFromColorset(randomItemFromArray(colorSets));
  console.log("Theme", theme);
  return theme;
}

module.exports = { getRandomTheme };
