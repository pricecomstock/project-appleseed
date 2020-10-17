import React, { Component } from "react";
import classNames from "classnames";
import C from "../../constants";

const {
  STATE_MACHINE: { STATES, TRANSITIONS },
} = C;

export default class ControlButtons extends Component {
  startGame = () => {
    this.props.socket.emit(TRANSITIONS.START_GAME);
  };

  closeRoom = () => {
    this.props.socket.emit("closeRoom");
  };

  skip = () => {
    this.props.socket.emit("skip");
  };

  closePrompts = () => {
    this.props.socket.emit(TRANSITIONS.CLOSE_PROMPTS);
  };

  closeVoting = () => {
    this.props.socket.emit(TRANSITIONS.CLOSE_VOTING);
  };

  nextSet = () => {
    this.props.socket.emit(TRANSITIONS.NEXT_SET);
  };
  endRound = () => {
    this.props.socket.emit(TRANSITIONS.END_ROUND);
  };

  endGame = () => {
    this.props.socket.emit(TRANSITIONS.END_GAME);
  };

  nextRound = () => {
    this.props.socket.emit(TRANSITIONS.NEXT_ROUND);
  };

  newGameNewPlayers = () => {
    this.props.socket.emit(TRANSITIONS.NEW_GAME_NEW_PLAYERS);
  };

  newGameSamePlayers = () => {
    this.props.socket.emit(TRANSITIONS.NEW_GAME_SAME_PLAYERS);
  };

  render() {
    return (
      <div className="admin-control-buttons">
        {(this.props.currentState === STATES.LOBBY ||
          this.props.currentState === STATES.FINAL_SCORES) && (
          <button className="game-button red" onClick={this.closeRoom}>
            Close Room
          </button>
        )}
        {this.props.currentState === STATES.LOBBY && (
          <button
            className={classNames("game-button", {
              teal: this.props.startable,
              disabled: !this.props.startable,
            })}
            onClick={() => {
              if (this.props.startable) this.startGame();
            }}
          >
            Start Game
          </button>
        )}
        {this.props.currentState === STATES.PROMPTS && (
          <button className="game-button orange" onClick={this.closePrompts}>
            Close Prompts
          </button>
        )}
        {this.props.currentState === STATES.VOTING && (
          <button className="game-button orange" onClick={this.closeVoting}>
            Close Voting
          </button>
        )}
        {this.props.currentState === STATES.SCORING && (
          <button className="game-button blue" onClick={this.skip}>
            Next
          </button>
        )}
        {this.props.currentState === STATES.SCORING && (
          <button className="game-button orange" onClick={this.endRound}>
            End Round
          </button>
        )}
        {this.props.currentState === STATES.SCORING && (
          <button className="game-button red" onClick={this.endGame}>
            End Game
          </button>
        )}
        {this.props.currentState === STATES.END_OF_ROUND && (
          <button className="game-button blue" onClick={this.nextRound}>
            Next Round
          </button>
        )}
        {this.props.currentState === STATES.FINAL_SCORES && (
          <button className="game-button teal" onClick={this.newGameNewPlayers}>
            Back To Lobby
          </button>
        )}
        {/* {this.props.currentState === STATES.FINAL_SCORES && (
          <button
            className="game-button yellow"
            onClick={this.newGameSamePlayers}
          >
            Another! (Same Players)
          </button>
        )} */}
      </div>
    );
  }
}
