import React, { Component } from "react";

export default class Timer extends Component {
  render() {
    return (
      <div>
        <div className="timer-bar">
          <span
            style={{
              width: `${(this.props.msRemaining / this.props.msTotal) * 100}%`,
              "background-color":
                this.props.msRemaining > 10000
                  ? "#b0db43"
                  : this.props.msRemaining > 3000
                  ? "#f4d35e"
                  : "#da4167",
              display: "block",
              height: "100%",
              position: "absolute",
            }}
          ></span>
          {this.props.showLabel && (
            <div className="timer-label">
              {this.props.msRemaining > 0
                ? Math.floor(this.props.msRemaining / 1000)
                : 0}
              s left for {this.props.label}
            </div>
          )}
        </div>
      </div>
    );
  }
}
