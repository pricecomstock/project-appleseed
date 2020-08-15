import React, { Component } from "react";

export default class Volume extends Component {
  render() {
    return (
      <button
        className="mini-button primary"
        onClick={this.props.toggleMute}
      >
        {this.props.muted ? "Muted" : "Mute"}
      </button>
    );
  }
}
