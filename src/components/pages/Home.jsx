import React, { Component } from "react";
import axios from "../../axios-backend";

export default class Home extends Component {
  createGame = () => {
    axios.post("/createroom").then((res) => {
      console.log(res);
      this.props.history.push(`/host/${res.data.code}`);
    });
    // .catch((err) => {
    //   console.error(err);
    // });
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
            />
          </div>
          <div className="control">
            <button className="button is-large is-primary">Join</button>
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
