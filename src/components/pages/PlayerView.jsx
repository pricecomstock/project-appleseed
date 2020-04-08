import React, { Component } from "react";
// import PropTypes from "prop-types";

import createSocketClient from "../../createSocketClient";

// https://www.valentinog.com/blog/socket-react/

export default class PlayerView extends Component {
  state = {
    log: ["hello, player!"],
  };

  componentDidMount() {
    const socket = createSocketClient();
    socket.on("connection", () => console.log("Connected!"));
    socket.on("state", (roomState) => {
      console.log("Room state updated");
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
