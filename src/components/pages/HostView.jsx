import React, { Component } from "react";
// import PropTypes from "prop-types";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class HostView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    gameState: {
      global: {
        players: [],
      },
    },
    adminKey: localStorage.getItem(`${this.props.match.params.code}_adminKey`),
    socket: createSocketClient(),
  };

  joinRoomAsAdmin = (roomCode, adminKey) => {
    this.state.socket.emit("joinroomasadmin", {
      roomCode: roomCode,
      adminKey: adminKey,
    });
  };

  joinThisRoomAsAdmin = () => {
    this.joinRoomAsAdmin(this.state.roomCode, this.state.adminKey);
  };

  componentDidMount() {
    this.state.socket.on("connection", () => console.log("Connected!"));
    this.state.socket.on("state", (gameState) => {
      console.log("Room state updated");
      this.setState({ gameState: gameState });
    });
    this.state.socket.on("adminkeyerror", (data) => {
      console.log("Admin Key Error");
    });

    this.joinThisRoomAsAdmin();
  }

  render() {
    return (
      <div>
        <div className="content">
          <h3>Room Code: {this.props.match.params.code}</h3>
          <h3>Admin Key: {this.state.adminKey}</h3>
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
