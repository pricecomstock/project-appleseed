const express = require("express");
const http = require("http");
const axios = require("axios");
const socketIo = require("socket.io");
const createRouter = require("./routes/router.js");

const port = process.env.PORT || 4001;

// index page to serve react bundle
const index = require("./routes/index");

// set up socketio
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
// pass to function that attaches room manager and manipulates it through API
const api = createRouter(io);

// Very open CORS rules
// TODO figure out production version of this
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(index);
app.use("/api", api);

server.listen(port, () => console.log(`Listening on port ${port}`));
