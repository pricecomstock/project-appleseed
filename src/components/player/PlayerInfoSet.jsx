import React, { Component } from "react";

import C from "../../constants";

export default class PlayerInfoSet extends Component {
  state = {
    name: "",
    emoji: "😀",
    showHelp: false,
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

  toggleHelp = () => {
    this.setState({ showHelp: !this.state.showHelp });
  };

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
        {this.state.showHelp && (
          <div className="help-tip">
            <p>type an emoji into the box!</p>
            <ul>
              <li>
                <b>- mobile</b>: use your emoji keyboard
              </li>
              <li>
                <b>- windows</b>: windows key + period
              </li>
              <li>
                <b>- mac</b>: ctrl + cmd + space
              </li>
              <li>
                <b>- idk lol:</b> copy & paste from{" "}
                <a href="https://getemoji.com/" target="_blank">
                  getemoji
                </a>
              </li>
            </ul>
          </div>
        )}
        <div className="player-info-edit-buttons">
          <div>
            <button className="game-button teal" onClick={this.sendUpdatedInfo}>
              Submit
            </button>
            <button className="game-button red" onClick={this.props.hide}>
              Close
            </button>
          </div>
          <button className="mini-button blue" onClick={this.toggleHelp}>
            emoji???
          </button>
        </div>
      </div>
    );
  }
}
