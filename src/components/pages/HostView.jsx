import React, { Component } from "react";
// import PropTypes from "prop-types";
import ReadingDisplay from "../host/ReadingDisplay";
import Scoreboard from "../host/Scoreboard";
import ControlButtons from "../host/ControlButtons";

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
    currentVotingResults: {},
    votingIsComplete: false,
    scoreboardData: [],
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

  getPlayerInfoById = (playerId) => {
    return this.state.players.find((player) => {
      return player.playerId === playerId;
    });
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
      this.setState({
        votingIsComplete: false,
        filledPrompt: data.prompt,
        currentVotingResults: {},
      });
    });

    this.state.socket.on("votingresults", (data) => {
      this.setState({
        currentVotingResults: data.votingResults,
        votingIsComplete: true,
      });
    });

    this.state.socket.on("scoreboarddata", (data) => {
      this.setState({ scoreboardData: data.scoreboardData });
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
          <h3>Players:</h3>
          <ul>
            {this.state.players.map((player, index) => (
              <li key={index}>
                {player.emoji} {player.nickname}
              </li>
            ))}
          </ul>
          <h3>GameState: {this.state.currentState}</h3>
        </div>
        <ControlButtons
          currentState={this.state.currentState}
          socket={this.state.socket}
        ></ControlButtons>
        <hr />
        {(this.state.currentState === "reading" ||
          this.state.currentState === "voting" ||
          this.state.currentState === "scoring") &&
          this.state.filledPrompt && (
            <ReadingDisplay
              prompt={this.state.filledPrompt}
              votingResults={this.state.currentVotingResults}
              votingIsComplete={this.state.votingIsComplete}
              getPlayerInfoById={this.getPlayerInfoById}
            ></ReadingDisplay>
          )}
        {(this.state.currentState === "endOfRound" ||
          this.state.currentState === "finalScores") && (
          <Scoreboard data={this.state.scoreboardData}></Scoreboard>
        )}
      </div>
    );
  }
}
