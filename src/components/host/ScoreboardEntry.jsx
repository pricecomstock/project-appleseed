import React, { Component } from "react";
import classNames from "classnames";

export default class ScoreboardEntry extends Component {
  calculateSizeClass() {
    if (this.props.place === 1) {
      return "is-size-1";
    } else if (this.props.place === 2 || this.props.place === 3) {
      return "is-size-2";
    } else {
      return "is-size-4";
    }
  }

  render() {
    return (
      <div
        className={classNames([
          "level",
          {
            "leaderboard-first-box game-panel": this.props.place === 1,
            "leaderboard-second-box game-panel": this.props.place === 2,
            "leaderboard-third-box game-panel": this.props.place === 3,
            "leaderboard-low": this.props.place > 3,
            box: this.props.place <= 3,
          },
        ])}
      >
        <div className="level-left">
          <div className="level-item">
            <h1 className={this.calculateSizeClass()}>#{this.props.place}</h1>
          </div>
          <div className="level-item">
            <h3 className={this.calculateSizeClass()}>{this.props.emoji}</h3>
          </div>
          <div className="level-item">
            <h3 className={this.calculateSizeClass()}>{this.props.nickname}</h3>
          </div>
        </div>
        <div className="level-right">
          <div className="level-item">
            <h1 className={this.calculateSizeClass()}>{this.props.score}</h1>
          </div>
        </div>
      </div>
    );
  }
}
