// var Room = require("./room");
var GameRoom = require("./gameRoom");
const { generateBase64Id, adminRoom } = require("./util");
const C = require("../../src/constants");
const PlayerData = require("./playerData");

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
    this._rooms = new Map();

    this._purgeIntervalId = setInterval(() => {
      this.purgeInactiveRooms();
    }, C.ROOM_PURGE_INTERVAL_MS);

    this._io = io;
    this._io.on("connection", (socket) => {
      // io is the server
      // socket is the client connection
      // console.log("a socket connected", socket.handshake);

      let sendRoomUpdates = (roomCode) => {
        let roomToUpdate = this.getRoomWithCode(roomCode);
        if (roomToUpdate) {
          roomToUpdate.sendStateToAll();
          roomToUpdate.sendPlayerDataToAll();
        }
      };

      // Startup tasks

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
          let existingPlayer = joinedRoom.getPlayerDataWithId(requestedId);
          if (!joinedRoom.allowedToJoin && !existingPlayer) {
            socket.emit("unjoinable", { data: "can't join right now" });
            return;
          }
          // console.log("Joined room", joinedRoom);
          socket.join(roomCode);
          socket.roomCode = roomCode;

          // If we're in development, every instance should be new player
          if (requestedId && process.env.NODE_ENV !== "development") {
            console.log("player reconnecting");

            if (existingPlayer) {
              console.log("Player exists!", existingPlayer);
              socket.playerData = existingPlayer;
              socket.playerData.connected = true;
              joinedRoom.replacePlayerSocketForId(requestedId, socket);
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
        } else {
          socket.emit("roomdoesnotexisterror", {});
          socket.disconnect(true);
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
          socket.disconnect(true);
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

  async createNewRoom() {
    let newRoom = await GameRoom.CreateAsync(
      this.randomAvailableRoomCode(),
      this._io
    );
    this._rooms.set(newRoom.code, newRoom);

    return newRoom;
  }

  deleteRooms(roomCodesToDelete) {
    roomCodesToDelete.forEach((code) => {
      this._rooms.delete(code);
    });
  }

  purgeInactiveRooms() {
    if (this._rooms.size === 0) return;

    let roomCodesToDelete = [...this._rooms.values()]
      .filter((room) => {
        return !room.isActive;
      })
      .map((room) => {
        return room.code;
      });
    if (roomCodesToDelete.length > 0) {
      this.deleteRooms(roomCodesToDelete);
    }
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
    return this._rooms.has(code);
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
    return this._rooms.get(code);
  }

  stats() {
    // let socketsConnected = Object.keys(this._io.sockets.connected);
    let currentTime = Date.now();
    let socketsConnected = Object.entries(this._io.sockets.connected).map(
      ([key, val]) => {
        return {
          id: key.substring(0, 4),
          userAgent: val.handshake["user-agent"],
          age: (currentTime - val.handshake.issued) / 1000,
        };
      }
    );
    return {
      roomsOpen: this._rooms.size,
      socketsConnectedCount: socketsConnected.length,
      socketsConnected: socketsConnected,
      roomStatsList: [...this._rooms.values()].map((room) => {
        return room.summaryForStats;
      }),
    };
  }
}

module.exports = RoomManager;
