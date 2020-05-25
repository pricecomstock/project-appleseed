import React, { Component } from "react";

export default class Volume extends Component {
  render() {
    return (
      <button
        className="button is-info is-rounded is-outlined is-small"
        onClick={this.props.toggleMute}
      >
        {this.props.muted ? "Muted" : "Mute"}
      </button>
    );
  }
}
