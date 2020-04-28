import React, { Component } from "react";
// import PropTypes from "prop-types";
import PlayerInfoSet from "../player/PlayerInfoSet";
import PlayerInfoView from "../player/PlayerInfoView";
import PlayerVote from "../player/PlayerVote";
import Prompt from "../player/Prompt";
import Timer from "../Timer";

import createSocketClient from "../../createSocketClient";
import { randomEmoji, randomPlayerName } from "../../util/flavor";

// https://www.valentinog.com/blog/socket-react/

import C from "../../constants";

export default class PlayerView extends Component {
  state = {
    roomCode: this.props.match.params.code,
    // players: [],
    currentState: "lobby",
    prompts: [],
    promptIndex: 0,
    socket: createSocketClient(),
    playerId: "",
    playerInfo: { emoji: randomEmoji(), nickname: randomPlayerName() },
    editingPlayerInfo: false,
    currentVotingMatchup: {},
    voteSubmitted: false,

    clientTimerCalculatedEndTime: 0,
    msRemaining: 0,
    msTotal: 1000,
    timerIsVisible: false,
    timerIntervalId: null,
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

  submitAnswer = (promptId, answer) => {
    this.state.socket.emit("answerprompt", {
      promptId,
      answer,
    });

    this.setState({ promptIndex: this.state.promptIndex + 1 });
  };

  submitVote = (index) => {
    this.state.socket.emit("vote", {
      index: index,
      playerId: this.state.playerId,
    });
    this.setState({ voteSubmitted: true });
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
    console.log(this.state);
    this.state.socket.on("connection", () => console.log("Connected!"));

    this.state.socket.on("state", (newGameState) => {
      console.log("Game state updated", newGameState);
      this.setState({
        currentState: newGameState.currentState,
        playerInfo: newGameState.players.find((player) => {
          return player.playerId === this.state.playerId;
        }),
      });
    });

    this.state.socket.on("playerIdAssigned", (assignedId) => {
      console.log("player ID assigned: ", assignedId);
      this.setState({ playerId: assignedId, editingPlayerInfo: true });
      localStorage.setItem(this.state.roomCode, this.state.playerId);
    });

    this.state.socket.on("prompts", (data) => {
      console.log("Received Prompts", data);
      this.setState({ prompts: data.prompts, promptIndex: 0 });
    });

    this.state.socket.on("votingoptions", (data) => {
      this.setState({
        currentVotingMatchup: data.currentVotingMatchup,
        voteSubmitted: false,
        prompts: [],
        promptIndex: 0,
      });
    });

    this.state.socket.on("timer", (data) => {
      // console.log("Date.now()", Date.now());
      console.log("Timer", data);
      this.startTimer(data.msTotal, data.msRemaining);
    });

    this.joinThisRoom();
  }

  componentWillUnmount() {
    this.state.socket.removeAllListeners();
  }

  render() {
    return (
      <div>
        {this.state.editingPlayerInfo &&
          this.state.currentState === "lobby" && (
            <PlayerInfoSet
              socket={this.state.socket}
              previousName={this.state.playerInfo.nickname}
              previousEmoji={this.state.playerInfo.emoji}
              hide={() => this.setState({ editingPlayerInfo: false })}
            ></PlayerInfoSet>
          )}
        <div className="content">
          <div className="level is-mobile">
            <div className="level-left">
              <div className="level-item">
                {this.state.timerIsVisible ? (
                  <span className="tag is-light is-warning is-medium">
                    {Math.floor(this.state.msRemaining / 1000)}s
                  </span>
                ) : (
                  <span className="tag is-light is-info is-medium">
                    {this.state.roomCode}
                  </span>
                )}
              </div>
            </div>
            <div className="level-right">
              <div className="level-item">
                {this.state.playerInfo && (
                  <PlayerInfoView
                    playerInfo={this.state.playerInfo}
                    canEdit={this.state.currentState === "lobby"}
                    onEdit={() => this.setState({ editingPlayerInfo: true })}
                  ></PlayerInfoView>
                )}
              </div>
            </div>
          </div>
        </div>

        {this.state.timerIsVisible && (
          <Timer
            msRemaining={this.state.msRemaining}
            msTotal={this.state.msTotal}
          ></Timer>
        )}
        <hr />
        {this.state.prompts.length > this.state.promptIndex && (
          <Prompt
            prompt={this.state.prompts[this.state.promptIndex]}
            submitAnswer={this.submitAnswer}
          ></Prompt>
        )}
        {this.state.currentState === "voting" &&
          this.state.voteSubmitted === false && (
            <PlayerVote
              submitVote={this.submitVote}
              currentVotingMatchup={this.state.currentVotingMatchup}
            ></PlayerVote>
          )}
      </div>
    );
  }
}
