import React, { Component } from "react";
// import PropTypes from "prop-types";
import PlayerInfoSet from "../PlayerInfoSet";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class PlayerView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    log: ["hello!"],
    gameState: {
      global: {
        players: [],
      },
    },
    socket: createSocketClient(),
    playerId: "",
  };

  joinRoom = (roomCode) => {
    let existingPlayerIdForRoom = localStorage.getItem(roomCode);
    console.log("existing ID: ", existingPlayerIdForRoom);
    this.state.socket.emit("joinroom", {
      roomCode: roomCode,
      requestedId: existingPlayerIdForRoom,
    });
  };

  joinThisRoom = () => {
    this.joinRoom(this.state.roomCode);
  };

  componentDidMount() {
    console.log(this.state);
    this.state.socket.on("connection", () => console.log("Connected!"));
    this.state.socket.on("state", (gameState) => {
      console.log("Room state updated");
      this.setState({ gameState: gameState });
      // this.state.log = this.setState({ log: [...this.state.log, ] });
    });
    this.state.socket.on("playerIdAssigned", (assignedId) => {
      console.log("player ID assigned: ", assignedId);
      this.setState({ playerId: assignedId });
      localStorage.setItem(this.state.roomCode, this.state.playerId);
    });
    this.joinThisRoom();
  }

  render() {
    return (
      <div>
        <p>Room Code: {this.state.roomCode}</p>
        <ul>
          {this.state.log.map((logline, index) => (
            <li key={index}>{logline}</li>
          ))}
        </ul>
        {true && (
          // {this.state.gameState.state == "preGame" && (
          <PlayerInfoSet socket={this.state.socket}></PlayerInfoSet>
        )}
      </div>
    );
  }
}
