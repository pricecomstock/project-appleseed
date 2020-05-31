import React, { Component } from "react";

export default class LobbyView extends Component {
  render() {
    return (
      <div className="container">
        <div className="has-text-centered is-size-2 game-panel">
          join at <span className="bold">{window.location.host}</span> by
          entering{" "}
          <a
            className="tag is-warning has-text-weight-bold is-size-2"
            href={`/play/${this.props.roomCode}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {this.props.roomCode}
          </a>
        </div>
      </div>
    );
  }
}
