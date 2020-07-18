const GameRoom = require("../game/gameRoom/index");
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

describe("gameRoom", () => {
  it("should start in lobby state", () => {
    expect(room).toBeDefined();
    expect(room.state).toBe("lobby");
  });

  it("should start allowed to join", () => {
    expect(room).toBeDefined();
    expect(room.allowedToJoin).toBe(true);
  });

  it("should not be active after closing", () => {
    room.closeRoom();
    expect(room.isActive).toBe(false);
  });
});
