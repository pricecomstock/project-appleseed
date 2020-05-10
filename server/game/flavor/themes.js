const { randomItemFromArray } = require("../util");

const FG_COLOR_DARK = "#050505";
const FG_COLOR_LIGHT = "#FAFAFA";

/*!
 * Get the contrasting color for any hex color
 * (c) 2019 Chris Ferdinandi, MIT License, https://gomakethings.com
 * Derived from work by Brian Suda, https://24ways.org/2010/calculating-color-contrast/
 * @param  {String} A hexColor value
 * @return {String} The contrasting color (black or white)
 */
function hexToRgb(hexColor) {
  // If a leading # is provided, remove it
  if (hexColor.slice(0, 1) === "#") {
    hexColor = hexColor.slice(1);
  }

  // If a three-character hexcode, make six-character
  if (hexColor.length === 3) {
    hexColor = hexColor
      .split("")
      .map(function (hex) {
        return hex + hex;
      })
      .join("");
  }

  // Convert to RGB value
  return {
    r: parseInt(hexColor.substr(0, 2), 16),
    g: parseInt(hexColor.substr(2, 2), 16),
    b: parseInt(hexColor.substr(4, 2), 16),
  };
}

function rgbToHex(rgb) {
  return `#${rgb.r.toString(16)}${rgb.g.toString(16)}${rgb.b.toString(16)}`;
}

function getFgColor(hexColor) {
  let rgb = hexToRgb(hexColor);
  // Get YIQ ratio
  var yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

  // Check contrast
  return yiq >= 128 ? FG_COLOR_DARK : FG_COLOR_LIGHT;
}

// I don't know about the color science of this
function getAverageColor(hexColor1, hexColor2) {
  let rgb1 = hexToRgb(hexColor1);
  let rgb2 = hexToRgb(hexColor2);
  let hex = rgbToHex({
    r: rgb1.r + rgb2.r / 2,
    g: rgb1.g + rgb2.g / 2,
    b: rgb1.b + rgb2.b / 2,
  });
  return hex;
}

// Also questionable color science
function isHighContrast(hexColor1, hexColor2) {
  const THRESHOLD = 25;

  let rgb1 = hexToRgb(hexColor1);
  let rgb2 = hexToRgb(hexColor2);

  let averageDistance =
    (Math.abs(rgb1.r - rgb2.r) +
      Math.abs(rgb1.g - rgb2.g) +
      Math.abs(rgb1.b - rgb2.b)) /
    3;

  let isHighContrast = averageDistance >= THRESHOLD;
  console.log(
    hexColor1,
    hexColor2,
    averageDistance,
    isHighContrast ? "HIGH" : "LOW"
  );
}

// Small patterns suitable for high contrast color pairs
const highContrastBackgroundClassNames = [
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
  "pattern-diagonal-lines-lg",
  "pattern-diagonal-lines-xl",
  "pattern-horizontal-lines-lg",
  "pattern-horizontal-lines-xl",
  "pattern-vertical-lines-lg",
  "pattern-vertical-lines-xl",
];

// Large patterns that should be used with low contrast color pairs
const lowContrastBackgroundClassNames = [
  "pattern-checks-sm",
  "pattern-checks-md",
  "pattern-checks-lg",
  "pattern-checks-xl",
  "pattern-grid-sm",
  "pattern-grid-md",
  "pattern-diagonal-lines-sm",
  "pattern-diagonal-lines-md",
  "pattern-horizontal-lines-sm",
  "pattern-horizontal-lines-md",
  "pattern-vertical-lines-sm",
  "pattern-vertical-lines-md",
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

const allBackgroundClassNames = [
  ...lowContrastBackgroundClassNames,
  ...highContrastBackgroundClassNames,
];

const colorSets = [];

function createColorSet(bgColor1, bgColor2, fgColor) {
  if (!fgColor) {
    // TODO calculate based on background colors
    fgColor = getFgColor(getAverageColor(bgColor1, bgColor2));
  }
  return { bgColor1, bgColor2, fgColor };
}

function generateThemeFromColorset(colorSet) {
  let isBgHighContrast = isHighContrast(colorSet.bgColor1, colorSet.bgColor2);
  return {
    backgroundStyles: {
      "background-color": colorSet.bgColor1,
      color: colorSet.bgColor2,
    },
    textColor: colorSet.fgColor,
    backgroundClasses: randomItemFromArray(
      isBgHighContrast
        ? highContrastBackgroundClassNames
        : allBackgroundClassNames
    ),
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
