const crypto = require("crypto");
const now = require("performance-now");

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
  shuffleArrayInPlace(array);
  return array;
}

function shuffleArrayInPlace(arr) {
  let currentIndex = arr.length;
  let temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = arr[currentIndex];
    arr[currentIndex] = arr[randomIndex];
    arr[randomIndex] = temporaryValue;
  }

  return arr;
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

class DeckRandomizer {
  constructor(arr) {
    // Sets directly to input array to allow for TypedArrays
    this.items = arr;
    shuffleArrayInPlace(this.items);

    this._pointer = 0;
  }

  draw() {
    if (this._pointer >= this.items.length) {
      this.reshuffleDeck();
    }
    let item = this.items[this._pointer];
    this._pointer += 1;
    return item;
  }

  drawMultiple(count) {
    if (count > this.items.length) {
      throw Error("cannot pick that many random items");
    }

    const itemsRemaining = this.items.length - this._pointer;
    if (count > itemsRemaining) {
      let initialItems = this.items.slice(this._pointer);
      this.reshuffleDeck();
      let nextSetOfItems = this.items.slice(0, count - initialItems.length);
      return [...initialItems, ...nextSetOfItems];
    } else {
      return this.items.slice(this._pointer, this._pointer + count);
    }
  }

  reshuffleDeck() {
    this._pointer = 0;
    shuffleArrayInPlace(this.items);
  }
}

class Counter {
  constructor() {
    this._counts = new Map();
  }

  increment(item) {
    let currentCount = this._counts.get(item) ?? 0;
    currentCount += 1;
    this._counts.set(item, currentCount);
    return currentCount;
  }

  decrement(item) {
    let currentCount = this._counts.get(item) ?? 0;
    currentCount -= 1;
    this._counts.set(item, currentCount);
    return currentCount;
  }

  getCount(item) {
    return this._counts.get(item);
  }

  counts() {
    return this._counts;
  }
}

module.exports = {
  generateBase64Id,
  adminRoom,
  playerRoom,
  audienceRoom,
  getShuffledCopyOfArray,
  shuffleArrayInPlace,
  randomItemFromArray,
  popRandomItemFromArray,
  randomItemsFromArrayWithoutRepeats,
  popRandomItemsFromArrayWithoutRepeats,
  mapToObject,
  DeckRandomizer,
  Counter,
};

// function speedTest(name, fn) {
//   const start = now();
//   fn();
//   console.log(`${name}: took ${now() - start}s`);
// }

// let tenThousand = [];
// for (let i = 0; i < 10000; i++) {
//   tenThousand.push(i);
// }
// let tenThousandUint = new Uint16Array(tenThousand);

// speedTest("uint16 DeckRandomizer 2000 single picks", () => {
//   let dr = new DeckRandomizer(tenThousandUint);
//   for (let i = 0; i < 2000; i++) {
//     dr.draw();
//   }
// });

// speedTest("uint16 DeckRandomizer pick 2000", () => {
//   let dr = new DeckRandomizer(tenThousandUint);
//   dr.drawMultiple(2000);
// });

// speedTest("plain array DeckRandomizer 2000 single picks", () => {
//   let dr = new DeckRandomizer(tenThousand);
//   for (let i = 0; i < 2000; i++) {
//     dr.draw();
//   }
// });

// speedTest("plain array DeckRandomizer pick 2000", () => {
//   let dr = new DeckRandomizer(tenThousand);
//   dr.drawMultiple(2000);
// });
