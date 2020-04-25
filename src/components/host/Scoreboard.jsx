import React, { Component } from "react";
import classNames from "classnames";
import ScoreboardEntry from "./ScoreboardEntry";

export default class Scoreboard extends Component {
  placeCutoff = 3;
  render() {
    return (
      <div className="columns is-centered">
        <div className="column is-half">
          {this.props.data.map((data, index) => {
            let place = index + 1;
            if (place > this.placeCutoff) {
              return null;
            }

            return (
              <ScoreboardEntry
                key={index}
                place={place}
                nickname={data.nickname}
                emoji={data.emoji}
                score={data.score}
              ></ScoreboardEntry>
            );
          })}
        </div>
        <div className="column is-half">
          {this.props.data.map((data, index) => {
            let place = index + 1;
            if (place <= this.placeCutoff) {
              return null;
            }

            return (
              <ScoreboardEntry
                key={index}
                place={place}
                nickname={data.nickname}
                emoji={data.emoji}
                score={data.score}
              ></ScoreboardEntry>
            );
          })}
        </div>
      </div>
    );
  }
}
