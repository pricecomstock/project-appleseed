import React, { Component } from "react";
import classNames from "classnames";

export default class PlayerList extends Component {
  render() {
    return (
      <div>
        <div className="lobby-player-view">
          {this.props.players.map((player, index) => (
            <div
              className={classNames(
                "lobby-player-list-item is-size-4 flex-center-text",
                this.props.extraCssClasses
              )}
              key={index}
              style={{ "animation-duration": "1.5s" }}
            >
              <span className="is-size-2">{player.emoji}</span>{" "}
              <span>{player.nickname}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
