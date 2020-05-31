import React, { Component } from "react";
import classNames from "classnames";
// import PropTypes from "prop-types";
import LobbyView from "../host/LobbyView";
import ReadingDisplay from "../host/ReadingDisplay";
import Scoreboard from "../host/Scoreboard";
import ControlButtons from "../host/ControlButtons";
import Timer from "../Timer";
import PlayerList from "../host/PlayerList";
import Options from "../host/Options";
import Volume from "../Volume";

import createSocketClient from "../../shared/createSocketClient";
import {
  sharedOnMountInit,
  sharedInitialState,
} from "../../shared/sharedViewInit";

// https://www.valentinog.com/blog/socket-react/

import audio from "../../audio/audio";

export default class HostView extends Component {
  state = {
    ...sharedInitialState(this.props),
    socket: createSocketClient(),

    players: [],
    adminKey: localStorage.getItem(`${this.props.match.params.code}_adminKey`),

    customSetData: {},

    yetToAnswer: [],

    filledPrompt: {},
    currentVotingResults: {},
    votingIsComplete: false,

    scoringDetails: {}, // For each vote
    scoreboardData: [], // For end of round/game
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

  loadCustomPromptSet = (code) => {
    this.state.socket.emit("loadcustomset", {
      code: code,
    });
  };

  componentDidMount() {
    sharedOnMountInit(this);
    // this.state.socket.on("connection", () => console.log("Connected!"));

    this.state.socket.on("players", (data) => {
      console.log("Players", data);
      if (data.players.length > this.state.players.length) {
        // New player
        audio.playCheck(this.state.volume);
      }
      this.setState({ players: data.players });
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
      audio.playWow(this.state.volume);
      this.setState({ scoreboardData: data.scoreboardData });
    });

    this.state.socket.on("custompromptstatus", (data) => {
      console.log("Custom Prompt Status", data);
      this.setState({
        customSetData: data,
      });
    });

    this.joinThisRoomAsAdmin();
  }

  componentWillUnmount() {
    this.state.socket.removeAllListeners();
  }

  render() {
    return (
      <div
        className={classNames("fun-bg", this.state.theme.backgroundClasses)}
        style={this.state.theme.backgroundStyles}
      >
        <div
          className="host-view"
          style={{ color: this.state.theme.textColor }}
        >
          {/* Admin Header */}
          <div className="host-header">
            <div className="game-panel">
              <div className="is-size-5">
                <p>
                  <span className="tag is-warning is-large has-text-weight-bold is-size-4">
                    {this.state.roomCode}
                  </span>{" "}
                  join at {window.location.host}
                </p>
              </div>
            </div>

            <div className="game-panel push-left flex-center-text">
              <Volume
                muted={this.state.volume == 0}
                toggleMute={this.toggleMute}
              ></Volume>
            </div>
            <div className="game-panel">
              <ControlButtons
                currentState={this.state.currentState}
                socket={this.state.socket}
              ></ControlButtons>
            </div>
          </div>
          {/* Debug View */}
          {this.state.debugDisplay && (
            <div className="game-panel level host-footer">
              <div className="level-left">
                <span className="level-item tag is-success is-medium">
                  Admin
                </span>
                <span className="level-item tag is-warning is-medium">
                  Debug View
                </span>
                <div className="level-item">
                  state={this.state.currentState}
                </div>
                <div className="level-item">
                  bg-pattern={this.state.theme.backgroundClasses}
                </div>
              </div>
            </div>
          )}
          {/* Timer */}
          {this.state.timerIsVisible && (
            <div className="host-footer">
              <Timer
                msRemaining={this.state.msRemaining}
                msTotal={this.state.msTotal}
                label={this.state.currentState}
                showLabel="true"
              ></Timer>
            </div>
          )}
          {/* Lobby View */}
          {this.state.currentState === "lobby" && (
            <>
              <div className="host-top-main">
                <LobbyView roomCode={this.state.roomCode}></LobbyView>
                <PlayerList
                  title={`${this.state.players.length}/16 players have joined`}
                  players={this.state.players}
                ></PlayerList>
              </div>
              <div className="host-lower game-panel">
                <Options
                  loadCustomPromptSet={this.loadCustomPromptSet}
                  loadedCustomSetData={this.state.customSetData}
                ></Options>
              </div>
            </>
          )}

          {this.state.currentState === "prompts" && (
            <>
              <div className="host-main">
                <PlayerList
                  title="Waiting on these players to answer their prompts!"
                  extraCssClasses="ld ld-bounce"
                  players={this.state.players.filter((player) => {
                    return this.state.yetToAnswer.includes(player.playerId);
                  })}
                ></PlayerList>
              </div>
              <div className="host-lower game-panel">
                <h1 className="has-text-centered is-size-2">
                  Answer prompts on your devices now!
                </h1>
              </div>
            </>
          )}
          {(this.state.currentState === "reading" ||
            this.state.currentState === "voting" ||
            this.state.currentState === "scoring") &&
            this.state.filledPrompt && (
              <div className="host-main">
                <ReadingDisplay
                  prompt={this.state.filledPrompt}
                  votingResults={this.state.currentVotingResults}
                  scoringDetails={this.state.scoringDetails}
                  votingIsComplete={this.state.votingIsComplete}
                  getPlayerInfoById={this.getPlayerInfoById}
                ></ReadingDisplay>
              </div>
            )}
          {(this.state.currentState === "endOfRound" ||
            this.state.currentState === "finalScores") && (
            <div className="host-main">
              <Scoreboard data={this.state.scoreboardData}></Scoreboard>
            </div>
          )}
        </div>
      </div>
    );
  }
}
