import socketIOClient from "socket.io-client";

const endpoint = "http://localhost:4001";

function createSocketClient() {
  const socket = socketIOClient(endpoint);
  return socket;
}

export default createSocketClient;
