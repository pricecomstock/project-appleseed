import React, { Component } from "react";

export default class PlayerVote extends Component {
  render() {
    return (
      <div className="buttons">
        {this.props.currentVotingMatchup.answers &&
          this.props.currentVotingMatchup.answers.map((answer, index) => {
            return (
              <button
                className="button is-large is-fullwidth is-outlined"
                onClick={() => {
                  this.props.submitVote(index);
                }}
              >
                {answer[1]}
              </button>
            );
          })}
      </div>
    );
  }
}
