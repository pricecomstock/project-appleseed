import React, { Component } from "react";

export default class PlayerStatusDisplay extends Component {
  render() {
    const showLobbyWaiting = this.props.state.currentState === "lobby";
    const showpromptWaiting =
      this.props.state.currentState === "prompts" &&
      this.props.state.promptIndex >= this.props.state.prompts.length;
    const showVoteWaiting =
      this.props.state.currentState === "voting" &&
      this.props.state.showVotingOptions === false;
    return (
      <>
        {(showLobbyWaiting || showpromptWaiting || showVoteWaiting) && (
          <div className="player-center game-panel player-status-container">
            {showLobbyWaiting && (
              <p className="player-status-text">
                Waiting on all players to join and for host to start the game...
              </p>
            )}
            {showpromptWaiting && (
              <p className="player-status-text">
                Waiting on other players to finish answering...
              </p>
            )}
            {showVoteWaiting && (
              <p className="player-status-text">
                Waiting on other players to vote...
              </p>
            )}
          </div>
        )}
      </>
    );
  }
}
