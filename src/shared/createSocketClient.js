import socketIOClient from "socket.io-client";

let endpoint = undefined;
if (process.env.NODE_ENV === "development") {
  endpoint = "http://localhost:4001";
}

function createSocketClient() {
  const socket = socketIOClient(endpoint);
  return socket;
}

export default createSocketClient;
