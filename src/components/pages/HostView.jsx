import React, { Component } from "react";
// import PropTypes from "prop-types";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class HostView extends Component {
  constructor() {
    super();
    this.state = {
      log: ["hello!"],
    };
  }

  componentDidMount() {
    const socket = createSocketClient();
    socket.on("connection", () => console.log("Connected!"));
    socket.on("state", (gameState) => {
      console.log("Room state updated");
      this.setState({ gameState: gameState });
      // this.state.log = this.setState({ log: [...this.state.log, ] });
    });
    this.setState({ socket: socket });
  }

  render() {
    return (
      <div>
        <p>Room Code: {this.props.match.params.code}</p>
        <ul>
          {this.state.log.map((logline, index) => (
            <li key={index}>{logline}</li>
          ))}
        </ul>
      </div>
    );
  }
}
