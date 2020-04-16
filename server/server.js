const express = require("express");
const http = require("http");
const cors = require("cors");
const axios = require("axios");
const socketIo = require("socket.io");
const createRouter = require("./routes/router.js");
console.log("ENV:", process.env.NODE_ENV);

const port = process.env.PORT || 4001;

// index page to serve react bundle
const index = require("./routes/index");

// set up socketio
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// pass to function that attaches room manager and manipulates it through API
const api = createRouter(io);

// CORS rules
if (process.env.NODE_ENV === "development") {
  app.options("*", cors());
  app.use("/api", cors(), api);
} else {
  app.use("/api", api);
}

app.use(index);

server.listen(port, () => console.log(`Listening on port ${port}`));
