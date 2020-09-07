import React, { Component } from "react";
import classNames from "classnames";

export default class PlayerList extends Component {
  render() {
    return (
      <div>
        <div className="lobby-player-list-title">
          <p>{this.props.title}</p>
        </div>
        <div className="lobby-player-list">
          {this.props.players.map((player, index) => (
            <div
              className={classNames(
                "lobby-player-list-item game-panel",
                this.props.extraCssClasses
              )}
              key={index}
              style={{ animationDuration: "1.5s" }}
            >
              <span className="nameplate-emoji">{player.emoji}</span>{" "}
              <span className="nameplate-name">{player.nickname}</span>
              {this.props.kickable && (
                <button
                  className="mini-button red"
                  onClick={() => {
                    this.props.kickfn(player.playerId);
                  }}
                >
                  kick
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
