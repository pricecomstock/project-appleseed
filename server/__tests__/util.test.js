let util = require("../game/util");
describe("Deck Randomizer", () => {
  let deck;
  let items = ["A", "B", "C"];
  let [A, B, C] = items;
  beforeEach(() => {
    deck = new util.DeckRandomizer(items);
  });

  test("should pick all items an equal number of times", () => {
    const pickedItems = new util.Counter();
    const PICKING_ROUNDS = 100;
    for (let i = 0; i < items.length * PICKING_ROUNDS; i++) {
      let picked = deck.draw();
      pickedItems.increment(picked);
    }
    console.log(pickedItems);
    expect(pickedItems.getCount(A)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(B)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(C)).toBe(PICKING_ROUNDS);
  });
});
