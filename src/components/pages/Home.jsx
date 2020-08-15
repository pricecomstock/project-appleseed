import React, { Component } from "react";
import axios from "../../axios-backend";
import { Link } from "react-router-dom";
import classNames from "classnames";

const homeTheme = {
  backgroundStyles: {
    backgroundColor: "#f3722c",
    color: "#f8961e",
  },
  textColor: "#000",
  backgroundClasses: "pattern-diagonal-stripes-xl",
};

export default class Home extends Component {
  state = { enteredCode: "" };

  createGame = () => {
    axios
      .post("/createroom")
      .then((res) => {
        console.log(res);
        localStorage.setItem(`${res.data.code}_adminKey`, res.data.adminKey);
        this.props.history.push(`/host/${res.data.code}`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  joinGame = () => {
    axios
      .post("/checkroom", { code: this.state.enteredCode })
      .then((res) => {
        let claimedExistingId = localStorage.getItem(res.data.code);
        // allowed to rejoin if existing player Id
        if (res.data.exists && (res.data.joinable || claimedExistingId)) {
          this.props.history.push(`/play/${res.data.code}`);
        } else if (
          res.data.exists &&
          !res.data.joinable &&
          !claimedExistingId // we don't have an existing player Id
        ) {
          console.log("Room is not joinable");
          this.setState({
            isJoinError: true,
            joinErrorMessage: "Room is not currently joinable.",
          });
        } else {
          console.log("Room does not exist");
          this.setState({
            isJoinError: true,
            joinErrorMessage: "Room not found.",
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleCodeChange = (event) => {
    this.setState({ enteredCode: event.target.value.substring(0, 4) });
  };

  render() {
    return (
      <div
        className={classNames("fun-bg", homeTheme.backgroundClasses)}
        style={homeTheme.backgroundStyles}
      >
        <div className="homepage">
          <div>
            <h1 className="bitwits-text-title">bitwits!</h1>
          </div>
          <div className="game-panel home-form">
            <h1>Enter a room code to join!</h1>
            <input
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  this.joinGame();
                }
              }}
              className=""
              type="text"
              placeholder="CODE"
              value={this.state.enteredCode}
              onChange={this.handleCodeChange}
            />
            <button
              className="join-button game-button success"
              onClick={this.joinGame}
            >
              Join
            </button>
            {this.state.isJoinError && (
              <p className="has-text-danger">{this.state.joinErrorMessage}</p>
            )}
            <hr />
            <p>
              Or{" "}
              <button onClick={this.createGame} className="mini-button warn">
                Create
              </button>{" "}
              a new one!
            </p>
            <div className="field"></div>
            <hr />
            Or <Link to="/customprompts">create your own set of prompts!</Link>
          </div>
        </div>
      </div>
    );
  }
}
