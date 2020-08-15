import React, { Component } from "react";

import C from "../../constants";

export default class PlayerInfoSet extends Component {
  state = {
    name: "",
    emoji: "😀",
  };

  sendUpdatedInfo = () => {
    this.props.socket.emit("updateplayerinfo", {
      nickname: this.state.name,
      emoji: this.state.emoji,
    });
    this.props.hide();
  };

  componentDidMount() {
    this.setState({
      name: this.props.previousName,
      emoji: this.props.previousEmoji,
    });
  }

  render() {
    return (
      <div className="game-panel on-top player-info-edit">
        Enter a name and emoji!
        <div className="field">
          <label className="label">Name</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={this.state.name}
              onChange={(event) =>
                this.setState({
                  name: event.target.value.substring(0, C.MAX_NAME_CHARS),
                })
              }
            />
          </div>
        </div>
        <div className="field">
          <label className="label">emoji</label>
          <div className="control">
            <input
              className="input"
              type="text"
              value={this.state.emoji}
              onChange={(event) => this.setState({ emoji: event.target.value })}
            />
          </div>
        </div>
        <button className="game-button teal" onClick={this.sendUpdatedInfo}>
          Submit
        </button>
        <button className="game-button red" onClick={this.props.hide}>
          Close
        </button>
      </div>
    );
  }
}
