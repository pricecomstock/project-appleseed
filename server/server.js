const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");
const createRouter = require("./routes/router.js");
const path = require("path");
console.log("ENV:", process.env.NODE_ENV);

const port = process.env.PORT || 4001;

// set up socketio
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// pass to function that attaches room manager and manipulates it through API
const api = createRouter(io);

// CORS rules and backend API
if (process.env.NODE_ENV === "development" || process.env.CORS === "allow") {
  app.options("*", cors());
  app.use("/api", cors(), api);
} else {
  app.use("/api", api);
}

// Static serve of build folder
app.use(express.static("build"));

// Fallback to sending index.hmtl
app.get("/*", (req, res) => {
  res.sendFile(path.resolve("./build/index.html"));
});

server.listen(port, () => console.log(`Listening on port ${port}`));
