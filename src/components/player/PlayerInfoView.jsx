import React, { Component } from "react";

export default class PlayerInfoView extends Component {
  render() {
    return (
      <div className="">
        <span className="">
          {this.props.playerInfo.emoji}&nbsp;
          {this.props.playerInfo.nickname}
        </span>
        {this.props.canEdit && (
          <span onClick={this.props.onEdit} style={{ cursor: "pointer" }}>
            {" "}
            <span className="mini-button primary">Edit</span>
          </span>
        )}
      </div>
    );
  }
}
