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
            this.props.currentVotingMatchup.answers.map((answer, index) => {
              return (
                <button
                  className="button is-medium is-fullwidth is-outlined wrapped-text"
                  onClick={() => {
                    this.props.submitVote(index);
                  }}
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
