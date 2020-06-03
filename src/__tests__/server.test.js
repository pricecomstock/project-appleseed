const rm = require("../../server/game/roomManager");
const socketIo = require("socket.io");

// var io = null;
// var rm = null;

// beforeEach(() => {
//   // NOTE anything in this function must be saved into global scope for access by test
//   io = new socketIo();
//   rm = new RoomManager(io);
//   // console.log("io", typeOf(io));
//   // console.log("rm", typeOf(rm));
//   // return io;
// });

// test("room manager creates room", () => {
//   // const room = rm.createNewRoom();
//   expect(io).not.toBeNull();
// });

test("ez", () => {
  expect(1 + 2).toBe(3);
});
