const socketIo = require("socket.io");

function initialize(io) {
  io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("disconnect", () => console.log("Client disconnected"));
  });
}

module.exports = initialize;
