import React, { Component } from "react";
import axios from "../../axios-backend";

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
      <div className="container has-text-centered">
        <header>
          <h1 className="title">bitwits!</h1>
        </header>
        <div className="columns is-centered">
          <div className="column is-one-third-tablet">
            <h2 className="subtitle">Enter a room code to join!</h2>
            <div
              className="field has-addons is-grouped-centered"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  this.joinGame();
                }
              }}
            >
              <div className="control is-expanded">
                <input
                  className="input is-large is-uppercase"
                  type="text"
                  placeholder="CODE"
                  value={this.state.enteredCode}
                  onChange={this.handleCodeChange}
                />
              </div>
              <div className="control">
                <button
                  className="button is-large is-primary"
                  onClick={this.joinGame}
                >
                  Join
                </button>
              </div>
            </div>
            {this.state.isJoinError && (
              <p class="has-text-danger">{this.state.joinErrorMessage}</p>
            )}
            <hr />
            <p>Or create a new one!</p>
            <button
              onClick={this.createGame}
              className="button is-primary is-outlined is-large"
            >
              Create Game
            </button>
            <hr />
            Or <a href="/uploadprompts">create your own set of prompts!</a>
          </div>
        </div>
      </div>
    );
  }
}
