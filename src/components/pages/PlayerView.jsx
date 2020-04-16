import React, { Component } from "react";
// import PropTypes from "prop-types";
import PlayerInfoSet from "../PlayerInfoSet";
import PlayerInfoView from "../PlayerInfoView";
import Prompt from "../Prompt";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class PlayerView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    // players: [],
    currentState: "lobby",
    prompts: [],
    socket: createSocketClient(),
    playerId: "",
    editingPlayerInfo: false,
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
      this.setState({ currentState: newGameState.currentState });
    });

    this.state.socket.on("playerIdAssigned", (assignedId) => {
      console.log("player ID assigned: ", assignedId);
      this.setState({ playerId: assignedId });
      localStorage.setItem(this.state.roomCode, this.state.playerId);
    });

    this.state.socket.on("prompts", (data) => {
      console.log("Received Prompts", data);
      this.setState({ prompts: data.prompts });
    });

    this.joinThisRoom();
  }

  render() {
    return (
      <div>
        <div className="content">
          <div className="level is-mobile">
            <div className="level-left">
              <div className="level-item">
                <span className="tag is-light is-info is-large">Player</span>
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                <PlayerInfoView
                  emoji="😷"
                  name="Test Player"
                  onEdit={() => this.setState({ editingPlayerInfo: true })}
                ></PlayerInfoView>
              </div>
            </div>
          </div>
          <h3>Room Code: {this.state.roomCode}</h3>
          <p>Player ID: {this.state.playerId}</p>
          <h3>Prompts</h3>
          <ul>
            {this.state.prompts.map((prompt, index) => (
              <li key={index}>{prompt.text}</li>
            ))}
          </ul>
        </div>
        <hr />
        {true && (
          // {this.state.gameState.state == "preGame" && (
          <PlayerInfoSet
            socket={this.state.socket}
            active={this.state.editingPlayerInfo}
            hide={() => this.setState({ editingPlayerInfo: false })}
          ></PlayerInfoSet>
        )}
        <Prompt prompt={"Here's a test question"}></Prompt>
      </div>
    );
  }
}
