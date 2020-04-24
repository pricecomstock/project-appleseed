import React, { Component } from "react";
import classNames from "classnames";

export default class Timer extends Component {
  render() {
    return (
      <div>
        <progress
          className={classNames("progress", "is-large", {
            "is-primary": this.props.msRemaining > 10000,
            "is-warning":
              this.props.msRemaining <= 10000 && this.props.msRemaining > 3000,
            "is-danger": this.props.msRemaining <= 3000,
          })}
          value={this.props.msRemaining}
          max={this.props.msTotal}
        >
          {Math.floor(this.props.msRemaining / 1000)}s
        </progress>
        <div className="has-text-centered is-size-3">
          {this.props.msRemaining > 0
            ? Math.floor(this.props.msRemaining / 1000)
            : 0}
          s left for {this.props.label}
        </div>
      </div>
    );
  }
}
