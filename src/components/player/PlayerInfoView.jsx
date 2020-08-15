import React, { Component } from "react";

export default class PlayerInfoView extends Component {
  render() {
    return (
      <div className="inline-flex">
        {this.props.playerInfo.emoji}&nbsp;
        {this.props.playerInfo.nickname}&nbsp;
        {this.props.canEdit && (
          <button onClick={this.props.onEdit} className="mini-button yellow">
            Edit
          </button>
        )}
      </div>
    );
  }
}
