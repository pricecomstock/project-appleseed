import React, { Component } from "react";
import classNames from "classnames";

export default class PlayerList extends Component {
  render() {
    return (
      <div>
        <div className="lobby-player-view">
          {this.props.players.map((player, index) => (
            <div
              className={classNames("box is-size-4 freshly-added", {
                vibrate: this.props.vibrate,
              })}
              key={index}
            >
              <span className="is-size-2">{player.emoji}</span>{" "}
              {player.nickname}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
