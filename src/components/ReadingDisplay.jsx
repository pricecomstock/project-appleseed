import React, { Component } from "react";

export default class ReadingDisplay extends Component {
  render() {
    return (
      <div>
        {this.props.prompts.map((prompt) => {
          return <div className="box">{prompt.text}</div>;
        })}
      </div>
    );
  }
}
