import React, { Component } from "react";

export default class ReadingDisplay extends Component {
  render() {
    return (
      <div>
        <h1 className="title">{this.props.prompt.text}</h1>
        {/* <p>{this.props.prompt.id}</p> */}
        <div className="columns is-centered is-vcentered is-multiline">
          {this.props.prompt.answers &&
            this.props.prompt.answers.map((answer) => {
              return (
                <div className="column is-one-third">
                  <div className="box prompt-box">
                    <h3 className="subtitle">{answer[1]}</h3>
                    <span className="tag is-light is-warning">{answer[0]}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
