import React, { Component } from "react";
import classNames from "classnames";

export default class AnswerCard extends Component {
  render() {
    return (
      <div className="">
        <div className="box has-text-centered">
          <h3 className={classNames(this.textClass())}>{this.props.text}</h3>
          {this.props.votingIsComplete && (
            <span className="tag is-info is-large">
              {this.props.playerData.emoji} {this.props.playerData.nickname}
            </span>
          )}
        </div>
        {this.props.votingIsComplete && (
          <div>
            <div className="tags">
              <span className="tag is-success is-large">
                + {this.props.basePoints}
              </span>
              {this.props.isShutout && (
                <span className="tag is-success is-light is-large">
                  + {this.props.shutoutPoints} for shutout!
                </span>
              )}
            </div>
            <div className="tags">
              {this.props.voters.map((playerData, voterIndex) => {
                return (
                  <span className="tag is-medium is-light" key={voterIndex}>
                    {/* FIXME this is probably very bad performance */}
                    {playerData.emoji}
                    &nbsp;
                    {playerData.nickname}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }
}
