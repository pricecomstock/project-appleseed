import React, { Component } from "react";

export default class PlayerInfoView extends Component {
  render() {
    return (
      <div className="tags has-addons are-large">
        <span className="tag is-light is-info">
          {this.props.playerInfo.emoji}&nbsp;
          {this.props.playerInfo.nickname}
        </span>
        {this.props.canEdit && (
          <span
            className="tag is-light is-warning"
            onClick={this.props.onEdit}
            style={{ cursor: "pointer" }}
          >
            Edit
          </span>
        )}
      </div>
    );
  }
}
