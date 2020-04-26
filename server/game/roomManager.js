// var Room = require("./room");
var GameRoom = require("./gameRoom");
const { generateBase64Id, adminRoom } = require("./util");
const PlayerData = require("./playerData");

// TODO: implement namespace "garbage collection"

function generateRoomCode() {
  const codeLength = 4;
  // const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  // Letters removed to censor bad words
  const validCharacters = "ABCDEFHJLMNOPQRSTVWXYZ";

  let code = "";
  for (let i = 0; i < codeLength; i++) {
    // maybe replace with not pseudo-random
    code += validCharacters[Math.floor(Math.random() * validCharacters.length)];
  }

  return code;
}

class RoomManager {
  constructor(io) {
    this._rooms = [];

    this._io = io;
    this._io.on("connection", (socket) => {
      // io is the server
      // socket is the client connection

      let sendRoomUpdates = (roomCode) => {
        let roomToUpdate = this.getRoomWithCode(roomCode);
        if (roomToUpdate) {
          roomToUpdate.sendStateToAll();
        }
      };

      // Startup tasks
      // console.log(code, "a user connected");

      // client will use this to join a room
      socket.on("joinroom", (data) => {
        const roomCode = data.roomCode;
        const requestedId = data.requestedId;

        if (socket.rooms) {
          // socket already was in a room
          socket.leaveAll();
          socket.roomCode = "";
        }

        if (this.checkRoomExists(roomCode)) {
          let joinedRoom = this.getRoomWithCode(roomCode);
          if (!joinedRoom.allowedToJoin) {
            socket.emit("unjoinable", { data: "can't join right now" });
            return;
          }
          // console.log("Joined room", joinedRoom);
          socket.join(roomCode);
          socket.roomCode = roomCode;

          // If we're in development, every instance should be new player
          if (requestedId && process.env.NODE_ENV !== "development") {
            console.log("player reconnecting");
            let existingPlayer = joinedRoom.getPlayerDataWithId(requestedId);
            if (existingPlayer) {
              console.log("Player exists!", existingPlayer);
              socket.playerData = existingPlayer;
              socket.playerData.connected = true;
            } else {
              console.log(
                `Claimed ID ${requestedId} does not exist, creating a new one.`
              );
              socket.playerData = new PlayerData();
              joinedRoom.addPlayer(socket);
            }
          } else {
            console.log("player not claiming to exist, adding as new player");
            socket.playerData = new PlayerData();
            joinedRoom.addPlayer(socket);
          }

          socket.emit("playerIdAssigned", socket.playerData.playerId);
          sendRoomUpdates(roomCode);
        }
      });

      socket.on("joinroomasadmin", (data) => {
        let roomCode = data.roomCode;
        if (socket.rooms) {
          // socket already was in a room
          socket.leaveAll();
          socket.roomCode = "";
        }
        if (
          this.checkRoomExists(roomCode) &&
          data.adminKey === this.getRoomWithCode(roomCode).adminKey
        ) {
          socket.join(roomCode);
          socket.join(adminRoom(roomCode));

          socket.roomCode = roomCode;

          let roomToJoin = this.getRoomWithCode(roomCode);
          roomToJoin.addAdmin(socket);

          sendRoomUpdates(roomCode);
        } else {
          if (this.checkRoomExists(roomCode)) {
            socket.emit("adminkeyerror", {});
          } else {
            socket.emit("roomdoesnotexisterror", {});
          }
        }
      });

      socket.on("disconnect", (reason) => {
        if (socket.playerData) {
          console.log("disconnect", reason);
          socket.playerData.connected = false;
          // rooms are left automatically upon disconnection
          sendRoomUpdates(socket.roomCode);
        }
      });

      socket.on("playerreconnect", (reason) => {
        if (socket.playerData) {
          console.log("reconnect", reason);
          socket.playerData.connected = true;
          // rooms are left automatically upon disconnection
          sendRoomUpdates(socket.roomCode);
        }
      });
    });
  }

  get rooms() {
    return this._rooms;
  }

  createNewRoom() {
    let newRoom = new GameRoom(this.randomAvailableRoomCode(), this._io);
    this._rooms.push(newRoom);
    // console.log(this._rooms);
    return {
      roomCode: newRoom.code,
      adminKey: newRoom.adminKey,
    };
  }

  randomAvailableRoomCode() {
    let potentialCode = "";

    // Keep generating codes until one is not taken
    do {
      potentialCode = generateRoomCode();
    } while (this.checkRoomExists(potentialCode));

    return potentialCode;
  }

  checkRoomExists(code) {
    return (
      this._rooms
        // Create array of room codes
        .map((room) => {
          return room.code;
        })
        // true if this array has our code in it
        .includes(code)
    );
  }

  checkRoomJoinability(code) {
    let room = this.getRoomWithCode(code);
    if (room && room.allowedToJoin) {
      return true;
    } else {
      return false;
    }
  }

  getRoomWithCode(code) {
    return this._rooms.find((room) => {
      return room.code === code;
    });
  }
}

module.exports = RoomManager;
