import React, { Component } from "react";
// import PropTypes from "prop-types";
import PlayerInfoSet from "../player/PlayerInfoSet";
import PlayerInfoView from "../player/PlayerInfoView";
import PlayerVote from "../player/PlayerVote";
import Prompt from "../player/Prompt";
import Timer from "../Timer";

import classNames from "classnames";

import createSocketClient from "../../shared/createSocketClient";
import {
  sharedOnMountInit,
  sharedInitialState,
} from "../../shared/sharedViewInit";

// https://www.valentinog.com/blog/socket-react/

import C from "../../constants";

export default class PlayerView extends Component {
  state = {
    ...sharedInitialState(this.props),
    socket: createSocketClient(),

    prompts: [],
    promptIndex: 0,
    playerId: "",
    playerInfo: { emoji: "😾", nickname: "player" },
    editingPlayerInfo: false,

    currentVotingMatchup: {},
    showVotingOptions: false,
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
    this.state.socket.emit(
      "answerprompt",
      {
        promptId,
        answer,
      },

      // Get acknowledgement from server before moving onto next prompt
      // The client would previousy continue as normal
      () => {
        this.setState({ promptIndex: this.state.promptIndex + 1 });
      }
    );
  };

  submitVote = (index) => {
    this.state.socket.emit(
      "vote",
      {
        index: index,
        playerId: this.state.playerId,
      },
      () => {
        this.setState({ showVotingOptions: false });
      }
    );
  };

  componentDidMount() {
    sharedOnMountInit(this);
    // this.state.socket.on("connection", () => {
    //   console.log("Connected!");
    //   this.setState({ connected: true });
    // });

    this.state.socket.on("players", (data) => {
      this.setState({
        playerInfo: data.players.find((player) => {
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
      let votingMode = this.state.gameOptions.rounds[
        this.state.currentRoundIndex
      ].votingMode;
      let showVotingOptions = true;
      // Don't show voting options if player participated in this question
      // and mode is NOT_OWN_QUESTIONS
      if (
        votingMode === C.VOTING_MODES.NOT_OWN_QUESTIONS &&
        // player was asked this prompt
        data.currentVotingMatchup.players.includes(this.state.playerId)
      ) {
        showVotingOptions = false;
      }
      this.setState({
        currentVotingMatchup: data.currentVotingMatchup,
        showVotingOptions: showVotingOptions,
        prompts: [],
        promptIndex: 0,
      });
    });

    this.joinThisRoom();
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
                {this.state.timerIsVisible && this.state.msRemaining > 0 ? (
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
        {!this.state.connected && (
          <p className="has-text-centered is-size-4 has-text-danger">
            Disconnected!
          </p>
        )}
        {this.state.prompts.length > this.state.promptIndex && (
          <Prompt
            prompt={this.state.prompts[this.state.promptIndex]}
            submitAnswer={this.submitAnswer}
          ></Prompt>
        )}
        {this.state.currentState === "prompts" &&
          this.state.promptIndex >= this.state.prompts.length && (
            <p className="has-text-centered is-size-4">
              Waiting on other players to finish answering...
            </p>
          )}
        {this.state.currentState === "lobby" && (
          <p className="has-text-centered is-size-4">
            Waiting on all players to join and for host to start the game...
          </p>
        )}
        {this.state.currentState === "voting" &&
          this.state.showVotingOptions === true && (
            <PlayerVote
              submitVote={this.submitVote}
              currentVotingMatchup={this.state.currentVotingMatchup}
              filterOwnAnswer={
                this.state.gameOptions.rounds[this.state.currentRoundIndex]
                  .votingMode === C.VOTING_MODES.NOT_OWN_ANSWER
              }
              playerId={this.state.playerId}
            ></PlayerVote>
          )}
        {this.state.currentState === "voting" &&
          this.state.showVotingOptions === false && (
            <p className="has-text-centered is-size-4">
              Waiting on other players to vote...
            </p>
          )}
      </div>
    );
  }
}
