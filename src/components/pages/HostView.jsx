import React, { Component } from "react";
// import PropTypes from "prop-types";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class HostView extends Component {
  state = {
    log: ["hello!"],
    gameState: {
      global: {
        players: [],
      },
    },
    socket: createSocketClient(),
  };

  joinRoom = (roomCode) => {
    let existingPlayerIdForRoom = localStorage.getItem(roomCode);
    console.log("existing ID: ", existingPlayerIdForRoom);
    this.state.socket.emit("joinroomasadmin", {
      roomCode: roomCode,
      requestedId: existingPlayerIdForRoom,
    });
  };

  joinThisRoom = () => {
    this.joinRoom(this.props.match.params.code);
  };

  componentDidMount() {
    this.state.socket.on("connection", () => console.log("Connected!"));
    this.state.socket.on("state", (gameState) => {
      console.log("Room state updated");
      this.setState({ gameState: gameState });
      // this.state.log = this.setState({ log: [...this.state.log, ] });
    });

    this.joinThisRoom();
  }

  render() {
    return (
      <div>
        <p>Room Code: {this.props.match.params.code}</p>
        <div className="content">
          <ul>
            {this.state.log.map((logline, index) => (
              <li key={index}>{logline}</li>
            ))}
          </ul>
          <h3>Players:</h3>
          <ul>
            {this.state.gameState.global.players.map((player, index) => (
              <li key={index}>{player.nickname}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
}
