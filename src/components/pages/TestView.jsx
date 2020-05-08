import React, { Component } from "react";
import ReadingDisplay from "../host/ReadingDisplay";

const testData = {
  prompt: {
    text:
      "What's a reasonable prompt? Not too long, not too short. Just right?",
    answers: [
      ["id", "Hell yeah"],
      ["id", "Cool!"],
      ["id", "A longer answer with a few short words! Maybe a little tag"],
      ["id", "Another normal answer"],
      ["id", "A looooooooooooooooooooooooooooooooooooooooooooooong word"],
      ["id", "How reasonable"],
    ],
  },
  playerData: {
    connected: true,
    nickname: "CoolPlayer",
    emoji: "🍻",
    playerId: "abcdefgi123",
  },
  scoringDetails: {
    pointsArray: [6000, 0, 0, 0, 0, 0],
    isShutout: true,
    shutoutIndex: 0,
    shutoutPoints: "1000",
  },
  votingResults: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 1 },
};

export default class TestView extends Component {
  state = {
    rd_votingComplete: true,
  };
  toggleVotingComplete = () => {
    this.setState({
      rd_votingComplete: !this.state.rd_votingComplete,
    });
  };
  render() {
    return (
      <div>
        <button onClick={this.toggleVotingComplete}>
          Toggle Voting Complete
        </button>
        <ReadingDisplay
          prompt={testData.prompt}
          votingResults={testData.votingResults}
          scoringDetails={testData.scoringDetails}
          votingIsComplete={this.state.rd_votingComplete}
          getPlayerInfoById={(id) => {
            return testData.playerData;
          }}
        ></ReadingDisplay>
      </div>
    );
  }
}
