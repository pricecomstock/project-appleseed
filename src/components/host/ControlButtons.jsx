import React, { Component } from "react";

export default class ControlButtons extends Component {
  startGame = () => {
    this.props.socket.emit("startGame");
  };

  closeRoom = () => {
    this.props.socket.emit("closeRoom");
  };

  skip = () => {
    this.props.socket.emit("skip");
  };

  closePrompts = () => {
    this.props.socket.emit("closePrompts");
  };

  closeVoting = () => {
    this.props.socket.emit("closeVoting");
  };

  nextSet = () => {
    this.props.socket.emit("nextSet");
  };
  endRound = () => {
    this.props.socket.emit("endRound");
  };

  endGame = () => {
    this.props.socket.emit("endGame");
  };

  nextRound = () => {
    this.props.socket.emit("nextRound");
  };

  newGameNewPlayers = () => {
    this.props.socket.emit("newGameNewPlayers");
  };

  newGameSamePlayers = () => {
    this.props.socket.emit("newGameSamePlayers");
  };

  render() {
    return (
      <div className="">
        {(this.props.currentState === "lobby" ||
          this.props.currentState === "finalScores") && (
          <button className="game-button red" onClick={this.closeRoom}>
            Close Room
          </button>
        )}
        {this.props.currentState === "lobby" && (
          <button className="game-button teal" onClick={this.startGame}>
            Start Game
          </button>
        )}
        {this.props.currentState === "prompts" && (
          <button className="game-button orange" onClick={this.closePrompts}>
            Close Prompts
          </button>
        )}
        {this.props.currentState === "voting" && (
          <button className="game-button orange" onClick={this.closeVoting}>
            Close Voting
          </button>
        )}
        {this.props.currentState === "scoring" && (
          <button className="game-button blue" onClick={this.skip}>
            Next
          </button>
        )}
        {this.props.currentState === "scoring" && (
          <button className="game-button orange" onClick={this.endRound}>
            End Round
          </button>
        )}
        {this.props.currentState === "scoring" && (
          <button className="game-button red" onClick={this.endGame}>
            End Game
          </button>
        )}
        {this.props.currentState === "endOfRound" && (
          <button className="game-button blue" onClick={this.nextRound}>
            Next Round
          </button>
        )}
        {this.props.currentState === "finalScores" && (
          <button className="game-button teal" onClick={this.newGameNewPlayers}>
            Back To Lobby
          </button>
        )}
        {this.props.currentState === "finalScores" && (
          <button
            className="game-button yellow"
            onClick={this.newGameSamePlayers}
          >
            Another! (Same Players)
          </button>
        )}
      </div>
    );
  }
}
