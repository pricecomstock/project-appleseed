import React, { Component } from "react";
// import PropTypes from "prop-types";
import LobbyView from "../host/LobbyView";
import ReadingDisplay from "../host/ReadingDisplay";
import Scoreboard from "../host/Scoreboard";
import ControlButtons from "../host/ControlButtons";
import Timer from "../Timer";
import PlayerList from "../host/PlayerList";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

import C from "../../constants";

export default class HostView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    players: [],
    currentState: "lobby",
    adminKey: localStorage.getItem(`${this.props.match.params.code}_adminKey`),
    socket: createSocketClient(),

    yetToAnswer: [],

    filledPrompt: {},
    currentVotingResults: {},
    votingIsComplete: false,

    scoringDetails: {}, // For each vote
    scoreboardData: [], // For end of round/game

    clientTimerCalculatedEndTime: 0,
    msRemaining: 0,
    msTotal: 1000,
    timerIsVisible: false,
    timerIntervalId: null,

    debugDisplay: false,
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

  startTimer(msTotal, msRemaining) {
    this.setState({
      clientTimerCalculatedEndTime:
        Date.now() + msRemaining - C.TIMER_SAFETY_BUFFER,
      msTotal: msTotal,
      // Safety buffer to err on giving players extra time
      msRemaining: msRemaining - C.TIMER_SAFETY_BUFFER,
      timerIsVisible:
        this.state.currentState === "voting" ||
        this.state.currentState === "prompts",
    });

    this.setState({
      timerIntervalId: setInterval(() => {
        this.setState({
          msRemaining: this.state.clientTimerCalculatedEndTime - Date.now(),
        });
      }, C.TIMER_COUNTDOWN_INTERVAL),
    });
  }

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

    this.state.socket.on("yettoanswer", (data) => {
      this.setState({ yetToAnswer: data.yetToAnswer });
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
      console.log("Voting Results", data);
      this.setState({
        currentVotingResults: data.votingResults,
        votingIsComplete: true,
        scoringDetails: data.scoringDetails,
      });
    });

    this.state.socket.on("scoreboarddata", (data) => {
      this.setState({ scoreboardData: data.scoreboardData });
    });

    this.state.socket.on("timer", (data) => {
      // console.log("Timer", data);
      this.startTimer(data.msTotal, data.msRemaining);
    });

    this.joinThisRoomAsAdmin();
  }

  componentWillUnmount() {
    this.state.socket.removeAllListeners();
  }

  render() {
    return (
      <div>
        {/* Admin Header */}
        <div className="level">
          <div className="level-left">
            <div className="level-item is-size-5">
              <p>
                <span className="tag is-info is-large has-text-weight-bold is-size-4">
                  {this.state.roomCode}
                </span>{" "}
                join at {window.location.host}
              </p>
            </div>
          </div>
          <div className="level-right">
            <ControlButtons
              currentState={this.state.currentState}
              socket={this.state.socket}
            ></ControlButtons>
          </div>
        </div>
        {/* Debug View */}
        {this.state.debugDisplay && (
          <div className="box level">
            <div className="level-left">
              <span className="level-item tag is-success is-medium">Admin</span>
              <span className="level-item tag is-warning is-medium">
                Debug View
              </span>
              <div className="level-item">state={this.state.currentState}</div>
            </div>
          </div>
        )}
        {/* Timer */}
        {this.state.timerIsVisible && (
          <Timer
            msRemaining={this.state.msRemaining}
            msTotal={this.state.msTotal}
            label={this.state.currentState}
            showLabel="true"
          ></Timer>
        )}
        {/* Lobby View */}
        {this.state.currentState === "lobby" && (
          <>
            <LobbyView
              players={this.state.players}
              roomCode={this.state.roomCode}
            ></LobbyView>
            <PlayerList players={this.state.players}></PlayerList>
          </>
        )}

        <hr />
        {this.state.currentState === "prompts" && (
          <PlayerList
            vibrate={true}
            players={this.state.players.filter((player) => {
              return this.state.yetToAnswer.includes(player.playerId);
            })}
          ></PlayerList>
        )}
        {(this.state.currentState === "reading" ||
          this.state.currentState === "voting" ||
          this.state.currentState === "scoring") &&
          this.state.filledPrompt && (
            <ReadingDisplay
              prompt={this.state.filledPrompt}
              votingResults={this.state.currentVotingResults}
              scoringDetails={this.state.scoringDetails}
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
