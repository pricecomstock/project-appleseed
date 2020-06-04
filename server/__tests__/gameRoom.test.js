const RoomManager = require("../game/roomManager.js");
const socketIo = require("socket.io");

var io = null;
var rm = null;
var room = null;

beforeEach(() => {
  // NOTE anything in this function must be saved into global scope for access by test
  io = new socketIo();
  rm = new RoomManager(io);
  return rm.createNewRoom().then((newRoom) => {
    room = newRoom;
  });
  // console.log("io", typeOf(io));
  // console.log("rm", typeOf(rm));
  // return io;
});

test("room is created and starts in lobby, allowed to join", () => {
  expect(room).toBeDefined();
  expect(room.state).toBe("lobby");
  expect(room.allowedToJoin).toBe(true);
});
