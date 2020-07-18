import React, { Component } from "react";
import classNames from "classnames";
import { CSSTransition } from "react-transition-group";
import "../../transitions.css";
import { addInvisibleHyphens } from "../../util/stringFilter";

const CHARACTERS_FOR_WORD_BREAK = 20;

export default class AnswerCard extends Component {
  render() {
    const breakableText = addInvisibleHyphens(
      this.props.text,
      CHARACTERS_FOR_WORD_BREAK
    );
    return (
      <div
        className={classNames("answer-card-container", {
          "winning-answer-card-container":
            this.props.votingIsComplete && this.props.isWinner,
          "losing-answer-card-container":
            this.props.votingIsComplete && !this.props.isWinner,
        })}
      >
        <div
          className={classNames("answer-card flex-center-text", {
            "winning-answer-card":
              this.props.votingIsComplete && this.props.isWinner,
            "losing-answer-card":
              this.props.votingIsComplete && !this.props.isWinner,
          })}
        >
          <p className="answer-text">{breakableText}</p>
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
                style={{ animationDuration: "1.5s" }}
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
          <div className="voters answer-badge">
            {this.props.voters.map((playerData, voterIndex) => {
              return (
                <span className="voter-icon" key={voterIndex}>
                  <div className="answer-badge-emoji">{playerData.emoji}</div>
                  <p>{playerData.nickname.substring(0, 3)}</p>
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
