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
        console.log(res);
        if (res.data.success) {
          this.props.history.push(`/play/${res.data.code}`);
        } else {
          console.log("Room does not exist!");
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  handleCodeChange = (event) => {
    this.setState({ enteredCode: event.target.value });
  };

  render() {
    return (
      <div className="container has-text-centered">
        <header>
          <h1 className="title">Project Appleseed</h1>
        </header>
        <div className="field has-addons is-grouped-centered">
          <div className="control">
            <input
              className="input is-large is-uppercase"
              type="text"
              placeholder="Room code"
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
        <hr />
        <p>Or create a new one!</p>
        <button
          onClick={this.createGame}
          className="button is-primary is-outlined is-large"
        >
          Create Game
        </button>
      </div>
    );
  }
}
