import React, { Component } from "react";

export default class PlayerVote extends Component {
  render() {
    return (
      <div className="container">
        <div className="has-text-centered is-size-4">
          {this.props.currentVotingMatchup.text}
        </div>
        <div className="buttons">
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
                    className="game-panel wrapped-text vote-button"
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
