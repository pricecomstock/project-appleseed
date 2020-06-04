const GameRoom = require("../game/gameRoom");
const socketIo = require("socket.io");

var io = null;
var room = null;

beforeEach(() => {
  // NOTE anything in this function must be saved into global scope for access by test
  io = new socketIo();
  return GameRoom.CreateAsync("TEST", io).then((newRoom) => {
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

test("game room shuts self down", () => {
  room.closeRoom();
  expect(room.isActive).toBe(false);
});
