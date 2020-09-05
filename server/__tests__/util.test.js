let util = require("../game/util");
describe("Deck Randomizer", () => {
  test("should pick all items an equal number of times", () => {
    let items = [1, 2, 3];
    let [A, B, C] = items;
    let deck = new util.DeckRandomizer(items);
    const pickedItems = new util.Counter();
    const PICKING_ROUNDS = 100;
    for (let i = 0; i < items.length * PICKING_ROUNDS; i++) {
      let picked = deck.draw();
      pickedItems.increment(picked);
    }
    expect(pickedItems.getCount(A)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(B)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(C)).toBe(PICKING_ROUNDS);
  });

  test("should work with strings", () => {
    let items = ["a", "b", "c"];
    let [A, B, C] = items;
    let deck = new util.DeckRandomizer(items);
    const pickedItems = new util.Counter();
    const PICKING_ROUNDS = 100;
    for (let i = 0; i < items.length * PICKING_ROUNDS; i++) {
      let picked = deck.draw();
      pickedItems.increment(picked);
    }
    expect(pickedItems.getCount(A)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(B)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(C)).toBe(PICKING_ROUNDS);
  });

  test("should work with and preserve typedArrays", () => {
    let items = new Uint16Array([1, 3, 5]);
    let [A, B, C] = items;
    let deck = new util.DeckRandomizer(items);
    const pickedItems = new util.Counter();
    const PICKING_ROUNDS = 100;
    for (let i = 0; i < items.length * PICKING_ROUNDS; i++) {
      let picked = deck.draw();
      pickedItems.increment(picked);
    }
    expect(pickedItems.getCount(A)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(B)).toBe(PICKING_ROUNDS);
    expect(pickedItems.getCount(C)).toBe(PICKING_ROUNDS);

    expect(deck.items.constructor.name).toBe("Uint16Array");
  });
});
