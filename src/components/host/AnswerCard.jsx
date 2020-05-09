import React, { Component } from "react";
import classNames from "classnames";

export default class AnswerCard extends Component {
  render() {
    console.log("voters", this.props.voters);
    return (
      <div className="answer-card-container">
        <div className="answer-card flex-center-text">
          <p className="is-size-4 answer-text">{this.props.text}</p>
        </div>
        {this.props.votingIsComplete && (
          <div className="author answer-badge">
            <div className="answer-badge-emoji">
              {this.props.playerData.emoji}
            </div>{" "}
            <div>{this.props.playerData.nickname}</div>
          </div>
        )}
        {this.props.votingIsComplete && (
          <div className="points">
            {this.props.isShutout && (
              <div className="answer-badge">
                + {this.props.shutoutPoints} (shutout)
              </div>
            )}
            <div className="answer-badge">+ {this.props.basePoints}</div>
          </div>
        )}
        {this.props.votingIsComplete && this.props.voters.length > 0 && (
          <div className="voters answer-badge answer-badge-emoji">
            {this.props.voters.map((playerData, voterIndex) => {
              return <span key={voterIndex}>{playerData.emoji}</span>;
            })}
          </div>
        )}
      </div>
    );
  }
}
