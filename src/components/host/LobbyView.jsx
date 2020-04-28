import React, { Component } from "react";

export default class LobbyView extends Component {
  render() {
    return (
      <div className="container">
        <div className="has-text-centered is-size-2">
          join at <strong>{window.location.host}</strong> by entering{" "}
          <span className="tag is-info has-text-weight-bold is-size-2">
            {this.props.roomCode}
          </span>
        </div>
        <div className="has-text-centered">
          <a
            href={`/play/${this.props.roomCode}`}
            className="button"
            target="_blank"
          >
            Join as Player in New Tab
          </a>
        </div>
        <hr />
        <h3 className="title has-text-centered">
          {this.props.players.length}/16 Players:
        </h3>
        {/* This would be easier to just do with CSS Flexbox */}

        <div className="lobby-player-view">
          {this.props.players.map((player, index) => (
            <div className="box is-size-4 freshly-added" key={index}>
              <span className="is-size-2">{player.emoji}</span>{" "}
              {player.nickname}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
