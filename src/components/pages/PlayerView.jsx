import React, { Component } from "react";
// import PropTypes from "prop-types";
import PlayerInfoSet from "../PlayerInfoSet";
import Prompt from "../Prompt";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class PlayerView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    gameState: {
      global: {
        players: [],
        currentState: "lobby",
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

    this.state.socket.on("state", (newGameState) => {
      console.log("Game state updated", newGameState);
      this.setState({ gameState: newGameState });
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
        <div className="content">
          <span className="tag is-light is-info is-large">Player</span>
          <h3>Room Code: {this.state.roomCode}</h3>
        </div>
        {true && (
          // {this.state.gameState.state == "preGame" && (
          <PlayerInfoSet socket={this.state.socket}></PlayerInfoSet>
        )}
        <Prompt prompt={"Here's a test question"}></Prompt>
      </div>
    );
  }
}
