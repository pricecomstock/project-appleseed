import React, { Component } from "react";

export default class PlayerVote extends Component {
  render() {
    return (
      <div className="game-panel player-interactive-panel">
        <div>
          <p className="player-prompt-text">
            {this.props.currentVotingMatchup.text}
          </p>
        </div>
        <div className="voting-options">
          {this.props.currentVotingMatchup.answers &&
            this.props.currentVotingMatchup.answers
              .map((answer, index) => {
                return [...answer, index]; // append original index before filtering
              })
              .filter((answer) => {
                // keep if we aren't filtering, or player ID doesn't match
                return (
                  !this.props.filterOwnAnswer ||
                  answer[0] !== this.props.playerId
                );
              })
              .map((answer, buttonIndex) => {
                let answerIndex = answer[2];
                return (
                  <button
                    className="wrapped-text game-button full-width vote-button"
                    onClick={() => {
                      this.props.submitVote(answerIndex);
                    }}
                    key={buttonIndex}
                  >
                    <p>{answer[1]}</p>
                  </button>
                );
              })}
        </div>
      </div>
    );
  }
}
