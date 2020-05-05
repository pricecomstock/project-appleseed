const crypto = require("crypto");

function generateBase64Id(numCharacters) {
  // Synchronous
  // 3 bytes = 4 base 64 characters
  const num_bytes = Math.floor(numCharacters * 0.75);
  const buf = crypto.randomBytes(num_bytes);
  return buf.toString("base64").replace(/\//g, "_").replace(/\+/g, "-");
}

function adminRoom(roomCode) {
  return `${roomCode}_admin`;
}

function playerRoom(roomCode) {
  return `${roomCode}_player`;
}

function audienceRoom(roomCode) {
  return `${roomCode}_audience`;
}

function getShuffledCopyOfArray(originalArray) {
  let array = [...originalArray];
  let currentIndex = array.length;
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function randomItemFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function popRandomItemFromArray(arr) {
  return arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
}

function randomItemsFromArrayWithoutRepeats(arr, n) {
  let arrCopy = [...arr];
  return popRandomItemsFromArrayWithoutRepeats(arrCopy, n);
}

// TODO convert this to only handle indexes for max efficiency
function popRandomItemsFromArrayWithoutRepeats(arr, n) {
  let selected = [];
  for (let i = 0; i < n; i++) {
    let item = arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
    selected.push(item);
  }
  return selected;
}

function mapToObject(map) {
  let obj = Array.from(map).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});

  return obj;
}

module.exports = {
  generateBase64Id,
  adminRoom,
  playerRoom,
  audienceRoom,
  getShuffledCopyOfArray,
  randomItemFromArray,
  popRandomItemFromArray,
  randomItemsFromArrayWithoutRepeats,
  popRandomItemsFromArrayWithoutRepeats,
  mapToObject,
};
