import React, { Component } from "react";
import classNames from "classnames";

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

  render() {
    return (
      <div>
        <div
          className={classNames("modal", { "is-active": this.props.active })}
        >
          <div className="modal-background"></div>
          <div className="modal-content">
            <div className="box">
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
                    onChange={(event) =>
                      this.setState({ emoji: event.target.value })
                    }
                  />
                </div>
              </div>
              <button
                className="button is-primary"
                onClick={this.sendUpdatedInfo}
              >
                Update
              </button>
            </div>
          </div>
          <button
            className="modal-close is-large"
            aria-label="close"
            onClick={() => this.props.hide()}
          ></button>
        </div>
      </div>
    );
  }
}
