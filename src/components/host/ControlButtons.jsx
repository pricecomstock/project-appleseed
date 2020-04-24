import React, { Component } from "react";

export default class ControlButtons extends Component {
  startGame = () => {
    this.props.socket.emit("startGame");
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
      <div className="buttons">
        {this.props.currentState === "lobby" && (
          <button className="button is-primary" onClick={this.startGame}>
            Start Game
          </button>
        )}
        {this.props.currentState === "prompts" && (
          <button className="button is-link" onClick={this.closePrompts}>
            Close Prompts
          </button>
        )}
        {this.props.currentState === "voting" && (
          <button className="button is-link" onClick={this.closeVoting}>
            Close Voting
          </button>
        )}
        {this.props.currentState === "scoring" && (
          <button className="button is-link" onClick={this.nextSet}>
            Next Set
          </button>
        )}
        {this.props.currentState === "scoring" && (
          <button
            className="button is-warning is-outlined is-small"
            onClick={this.endRound}
          >
            End Round
          </button>
        )}
        {this.props.currentState === "scoring" && (
          <button
            className="button is-danger is-outlined is-small"
            onClick={this.endGame}
          >
            End Game
          </button>
        )}
        {this.props.currentState === "endOfRound" && (
          <button className="button is-warning" onClick={this.nextRound}>
            Next Round
          </button>
        )}
        {this.props.currentState === "finalScores" && (
          <button
            className="button is-warning"
            onClick={this.newGameNewPlayers}
          >
            New Game, New Players
          </button>
        )}
        {this.props.currentState === "finalScores" && (
          <button
            className="button is-warning"
            onClick={this.newGameSamePlayers}
          >
            New Game, Same Players
          </button>
        )}
      </div>
    );
  }
}