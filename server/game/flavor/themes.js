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
  const THRESHOLD = 30;

  let rgb1 = hexToRgb(hexColor1);
  let rgb2 = hexToRgb(hexColor2);

  let averageDistance =
    (Math.abs(rgb1.r - rgb2.r) +
      Math.abs(rgb1.g - rgb2.g) +
      Math.abs(rgb1.b - rgb2.b)) /
    3;

  let isHighContrast = averageDistance >= THRESHOLD;
  // console.log(
  //   hexColor1,
  //   hexColor2,
  //   averageDistance,
  //   isHighContrast ? "HIGH" : "LOW"
  // );

  return isHighContrast;
}

// Small patterns suitable for high contrast color pairs
const highContrastBackgroundClassNames = [
  "pattern-grid-lg",
  "pattern-grid-xl",
  "pattern-dots-sm",
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
  "pattern-dots-md",
  "pattern-dots-lg",
  "pattern-dots-xl",
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

function createColorSet(bgColor1, bgColor2, accentColor, fgColor) {
  if (!accentColor) {
    // TODO calculate based on background colors
    accentColor = "#ffdd57;";
  }
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
        : lowContrastBackgroundClassNames
    ),
  };
}

colorSets.push(createColorSet("#577590", "#43aa8b"));
colorSets.push(createColorSet("#5B0102", "#3C1518"));
colorSets.push(createColorSet("#e56b6f", "#6d597a"));
colorSets.push(createColorSet("#00a9e2", "#f7fff7"));
colorSets.push(createColorSet("#efc3e6", "#f0e6ef"));
colorSets.push(createColorSet("#fca311", "#ffffff"));
colorSets.push(createColorSet("#7209b7", "#4361ee"));
colorSets.push(createColorSet("#ff686b", "#ffa69e"));
colorSets.push(createColorSet("#1a936f", "#88d498"));
colorSets.push(createColorSet("#f7b267", "#f79d65"));
colorSets.push(createColorSet("#6a6b83", "#76949f"));
colorSets.push(createColorSet("#048243", "#CAFFFB"));
colorSets.push(createColorSet("#247AFD", "#FE46A5"));
colorSets.push(createColorSet("#343837", "#03719C"));
colorSets.push(createColorSet("#CEA2FD", "#9900FA"));
colorSets.push(createColorSet("#FCB005", "#FF0789"));
colorSets.push(createColorSet("#000133", "#FC86AA"));
colorSets.push(createColorSet("#000000", "#FB5681"));
colorSets.push(createColorSet("#FF7E6B", "#FF907C"));
colorSets.push(createColorSet("#C5C3C6", "#DCDCDD"));
colorSets.push(createColorSet("#4F4E50", "#3C3B3D"));
colorSets.push(createColorSet("#7FC6A4", "#72B494"));
colorSets.push(createColorSet("#5D737E", "#7A8F98"));
colorSets.push(createColorSet("#AA1155", "#950E44"));
colorSets.push(createColorSet("#DD1155", "#E02363"));
colorSets.push(createColorSet("#541388", "#470F7C"));
colorSets.push(createColorSet("#CE8147", "#AF6739"));
colorSets.push(createColorSet("#0CCE6B", "#0AAB56"));
colorSets.push(createColorSet("#DCED31", "#F9FD51"));
colorSets.push(createColorSet("#363537", "#2B2A2C"));
colorSets.push(createColorSet("#F25757", "#D04646"));
colorSets.push(createColorSet("#61E8E1", "#57D3CC"));
colorSets.push(createColorSet("#423E37", "#E3B23C"));
colorSets.push(createColorSet("#29335C", "#3E476C"));
colorSets.push(createColorSet("#E4572E", "#F3A712"));
colorSets.push(createColorSet("#293F14", "#3D5227"));
colorSets.push(createColorSet("#2B50AA", "#5172BB"));
colorSets.push(createColorSet("#52489C", "#EBEBEB"));

// let testColorSet = createColorSet("#52489C", "#EBEBEB");

function getRandomTheme() {
  // let theme = generateThemeFromColorset(testColorSet); // TESTING
  // console.log("Theme", theme);
  // return theme;
  let theme = generateThemeFromColorset(randomItemFromArray(colorSets));
  return theme;
}

module.exports = { getRandomTheme };
