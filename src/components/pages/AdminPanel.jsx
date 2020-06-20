import React, { Component } from "react";
import axios from "../../axios-backend";

export default class AdminPanel extends Component {
  state = {
    stats: {
      roomsOpen: 0,
      socketsConnectedCount: 0,
      socketsConnected: [],
      roomStatsList: [],
    },
  };

  updateStats = () => {
    axios.get("/stats").then((res) => {
      console.log(res.data);
      let data = res.data;
      this.setState({ stats: data });
    });
  };

  render() {
    return (
      <div>
        <button className="game-button success" onClick={this.updateStats}>
          Refresh
        </button>
        <div className="game-panel">
          Rooms Open: {this.state.stats.roomsOpen}
        </div>
        <div className="game-panel">
          Room States:{" "}
          <ul>
            {this.state.stats.roomStatsList &&
              this.state.stats.roomStatsList.map((roomDetails) => {
                return (
                  <ul>
                    {roomDetails.state} / {roomDetails.playerCount}p /{" "}
                    {Math.floor(roomDetails.age)}s
                  </ul>
                );
              })}
          </ul>
        </div>
        <div className="game-panel">
          Sockets connected ({this.state.stats.socketsConnectedCount}):
          <ul>
            {this.state.stats.socketsConnected &&
              this.state.stats.socketsConnected.map((socketDetails) => {
                return (
                  <ul>
                    ID: {socketDetails.id} / {Math.floor(socketDetails.age)}s
                  </ul>
                );
              })}
          </ul>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.updateStats();
  }
}
