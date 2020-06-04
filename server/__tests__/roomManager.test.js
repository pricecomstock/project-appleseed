const RoomManager = require("../game/roomManager.js");
const socketIo = require("socket.io");

var io = null;
var rm = null;

jest.useFakeTimers();

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
    rm.deleteRooms([room.code], "test");
    expect(rm.checkRoomExists(room.code)).toBe(false);
  });
});

test("room closes and gets purged after 12 minutes but not 9 minutes", () => {
  return rm.createNewRoom().then((room) => {
    jest.advanceTimersByTime(9 * 60 * 1000);
    expect(rm.checkRoomExists(room.code)).toBe(true);
    jest.advanceTimersByTime(12 * 60 * 1000);
    expect(rm.checkRoomExists(room.code)).toBe(false);
  });
});

test("room manager purges inactive room after 2 minutes of being inactive", () => {
  return rm.createNewRoom().then((room) => {
    room.closeRoom();
    expect(rm.checkRoomExists(room.code)).toBe(true);
    jest.advanceTimersByTime(2 * 60 * 1000);
    expect(rm.checkRoomExists(room.code)).toBe(false);
  });
});
