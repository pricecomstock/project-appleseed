import React, { Component } from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import "../../transitions.css";

export default class AnswerCard extends Component {
  render() {
    return (
      <div className="answer-card-container">
        <div className="answer-card flex-center-text">
          <p className="answer-text">{this.props.text}</p>
        </div>
        {this.props.votingIsComplete && (
          <CSSTransition
            in={this.props.votingIsComplete}
            timeout={500}
            classNames="pop-in"
          >
            <div className="author answer-badge">
              <div className="answer-badge-emoji">
                {this.props.playerData.emoji}
              </div>{" "}
              <div>{this.props.playerData.nickname}</div>
            </div>
          </CSSTransition>
        )}
        {this.props.votingIsComplete && (
          <div className="points">
            {this.props.isShutout && (
              <div
                className="shutout answer-badge ld ld-tick"
                style={{ "animation-duration": "1.5s" }}
              >
                + {this.props.shutoutPoints} shutout
              </div>
            )}
            <div
              className={classNames("answer-badge", {
                "nonzero ld ld-beat": this.props.basePoints > 0,
              })}
            >
              + {this.props.basePoints}
            </div>
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
