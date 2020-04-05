const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");

const port = process.env.PORT || 4001;

const index = require("./routes/index");
const api = require("./routes/api");

const app = express();
app.use(index);
app.use("/api", api);

const server = http.createServer(app);

const io = socketIo(server);
