import React, { Component } from "react";
// import PropTypes from "prop-types";
import ReadingDisplay from "../ReadingDisplay";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class HostView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    players: [],
    currentState: "lobby",
    adminKey: localStorage.getItem(`${this.props.match.params.code}_adminKey`),
    socket: createSocketClient(),
    filledPrompt: {},
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

  startGame = () => {
    this.state.socket.emit("startGame");
  };

  closePrompts = () => {
    this.state.socket.emit("closePrompts");
  };

  closeVoting = () => {
    this.state.socket.emit("closeVoting");
  };

  componentDidMount() {
    this.state.socket.on("connection", () => console.log("Connected!"));

    this.state.socket.on("state", (newGameState) => {
      console.log("Game state updated", newGameState);
      this.setState({ currentState: newGameState.currentState });
      this.setState({ players: newGameState.players });
    });
    this.state.socket.on("adminkeyerror", (data) => {
      console.log("Admin Key Error");
    });

    this.state.socket.on("nextfilledprompt", (data) => {
      console.log("Filled Prompt:", data);
      this.setState({ filledPrompt: data.prompt });
    });

    this.joinThisRoomAsAdmin();
  }

  componentWillUnmount() {
    this.state.socket.removeAllListeners();
  }

  render() {
    return (
      <div>
        <div className="content">
          <span className="tag is-success is-large">Admin</span>
          <h3>Room Code: {this.props.match.params.code}</h3>
          <p>Admin Key: {this.state.adminKey}</p>
          <a
            href={`/play/${this.state.roomCode}`}
            className="button"
            target="_blank"
          >
            Join as Player
          </a>
          <h3>GameState: {this.state.currentState}</h3>
          <h3>Players:</h3>
          <ul>
            {this.state.players.map((player, index) => (
              <li key={index}>
                {player.emoji} {player.nickname}
              </li>
            ))}
          </ul>
        </div>
        {this.state.currentState === "lobby" && (
          <button className="button is-primary" onClick={this.startGame}>
            Start Game
          </button>
        )}
        {this.state.currentState === "prompts" && (
          <button className="button is-warning" onClick={this.closePrompts}>
            Close Prompts
          </button>
        )}
        {this.state.currentState === "voting" && (
          <button className="button is-warning" onClick={this.closeVoting}>
            Close Voting
          </button>
        )}
        <hr />
        {(this.state.currentState === "reading" ||
          this.state.currentState === "voting" ||
          this.state.currentState === "scoring") &&
          this.state.filledPrompt && (
            <ReadingDisplay prompt={this.state.filledPrompt}></ReadingDisplay>
          )}
      </div>
    );
  }
}
