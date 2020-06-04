const RoomManager = require("../game/roomManager.js");
const socketIo = require("socket.io");

var io = null;
var rm = null;

beforeEach(() => {
  // NOTE anything in this function must be saved into global scope for access by test
  io = new socketIo();
  rm = new RoomManager(io);
  // console.log("io", typeOf(io));
  // console.log("rm", typeOf(rm));
  // return io;
});

// have to return promise for testing async
test("room manager creates room", () => {
  return rm.createNewRoom().then((room) => {
    expect(room.state).toBe("lobby");
    expect(rm.checkRoomExists(room.code)).toBe(true);
  });
});

test("room manager deletes room", () => {
  return rm.createNewRoom().then((room) => {
    expect(rm.checkRoomExists(room.code)).toBe(true);
    rm.deleteRoom(room.code, "test");
    expect(rm.checkRoomExists(room.code)).toBe(false);
  });
});

test("ez", () => {
  expect(1 + 2).toBe(3);
});
