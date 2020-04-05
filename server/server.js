const express = require("express");
const http = require("http");
const axios = require("axios");
const io = require("./socket/socket"); // configuration for socket.io

const port = process.env.PORT || 4001;

const index = require("./routes/index");
const api = require("./routes/api");

const app = express();
app.use(index);
app.use("/api", api);

const server = http.createServer(app);
