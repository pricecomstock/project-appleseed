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
        <h1 className="title has-text-centered">
          {this.props.players.length}/16 Players:
        </h1>
        <div className="columns is-multiline">
          {this.props.players.map((player, index) => (
            <div className="column is-one-quarter is-size-4" key={index}>
              {player.emoji} {player.nickname}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
