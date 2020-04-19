import React, { Component } from "react";
import classNames from "classnames";

export default class Scoreboard extends Component {
  render() {
    return (
      <div className="columns is-centered">
        <div className="column is-half">
          {this.props.data.map((data, index) => {
            let place = index + 1;

            return (
              <div
                className={classNames([
                  "box",
                  "level",
                  {
                    "leaderboard-first-box": place === 1,
                    "leaderboard-second-box": place === 2,
                    "leaderboard-third-box": place === 3,
                  },
                ])}
              >
                <div className="level-left">
                  <div className="level-item">
                    <h1
                      className={classNames({
                        "is-size-1": place === 1,
                        "is-size-3": place !== 1,
                      })}
                    >
                      #{place}
                    </h1>
                  </div>
                  <div className="level-item">
                    <h3
                      className={classNames({
                        "is-size-2": place === 1,
                        "is-size-3": place !== 1,
                      })}
                    >
                      {data.emoji}
                    </h3>
                  </div>
                  <div className="level-item">
                    <h3
                      className={classNames({
                        "is-size-2": place === 1,
                        "is-size-3": place !== 1,
                      })}
                    >
                      {data.nickname}
                    </h3>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                    <h1
                      className={classNames({
                        "is-size-1": place === 1,
                        "is-size-3": place !== 1,
                      })}
                    >
                      {data.score}
                    </h1>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}
