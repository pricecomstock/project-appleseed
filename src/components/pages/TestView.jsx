import React, { Component } from "react";
import ReadingDisplay from "../host/ReadingDisplay";
import PlayerList from "../host/PlayerList";
import C from "../../constants";

const randomItemFromArray = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const nicknames = ["Cool Player", "pc", "SaRaH", "Joe", "Longname Fryer"];
const emoji = ["⚡", "🌈", "🍑", "🥑", "🌯", "🌭", "🌵", "🏈", "📀", "🗿"];
const randomPlayerData = (_id) => {
  return {
    connected: true,
    nickname: randomItemFromArray(nicknames),
    emoji: randomItemFromArray(emoji),
    playerId: "abcdefgi123",
  };
};

const generateTestData = (numPlayers) => {
  const generateAnswer = () => {
    const words = [
      "a",
      "ok",
      "the",
      "cool",
      "nice",
      "damn",
      "great",
      "while",
      "friend",
      "tastier",
      "goodbye",
      "kombucha",
      "greatest",
      "reasonable",
      "looooooooooooooong",
      "suuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuper",
    ];
    const numWords = Math.floor(Math.random() * 5) + 3;
    const answerWords = [];
    for (let i = 0; i < numWords; i++) {
      answerWords.push(words[Math.floor(Math.random() * words.length)]);
    }
    return answerWords.join(" ").substr(0, C.MAX_ANSWER_CHARS);
  };
  const generateAnswerPairs = (number) => {
    const pairs = [];
    for (let i = 0; i < number; i++) {
      pairs.push(["id", generateAnswer()]);
    }
    return pairs;
  };
  const generateVotingResults = (numPlayers) => {
    const results = {};
    const keys = Array(numPlayers)
      .fill(0)
      .map(() => {
        return Math.random() * 1000; // this might collide sometimes but its test data so oh well
      });
    for (const key of keys) {
      let setToZero = Math.random() < 0.7; // set most answers to 0 for testing longer groups
      results[key] = setToZero ? 0 : Math.floor(Math.random() * numPlayers);
    }
    return results;
  };
  return {
    prompt: {
      text:
        "What's a reasonable prompt? Not too long, not too short. Just right?",
      answers: generateAnswerPairs(numPlayers),
    },
    scoringDetails: {
      pointsArray: Array(numPlayers).fill(12000),
      isShutout: true,
      shutoutIndex: 0,
      shutoutPoints: "1000",
    },
    votingResults: generateVotingResults(numPlayers),
    players: Array(numPlayers)
      .fill(0)
      .map(() => {
        return randomPlayerData();
      }),
  };
};

export default class TestView extends Component {
  state = {
    rd_votingComplete: true,
    testData: generateTestData(6),
    numPlayers: 6,
  };
  toggleVotingComplete = () => {
    this.setState({
      rd_votingComplete: !this.state.rd_votingComplete,
    });
  };

  setNumPlayers = (numPlayers) => {
    this.setState({
      numPlayers: numPlayers,
      testData: generateTestData(numPlayers),
    });
  };

  render() {
    return (
      <div>
        <h1 className="title">ReadingView</h1>
        <button className="button" onClick={this.toggleVotingComplete}>
          Toggle Voting Complete
        </button>
        <button
          className="button"
          onClick={() => this.setNumPlayers(this.state.numPlayers - 1)}
        >
          Remove Player
        </button>
        <button
          className="button"
          onClick={() => this.setNumPlayers(this.state.numPlayers + 1)}
        >
          Add Player
        </button>
        <ReadingDisplay
          prompt={this.state.testData.prompt}
          votingResults={this.state.testData.votingResults}
          scoringDetails={this.state.testData.scoringDetails}
          votingIsComplete={this.state.rd_votingComplete}
          getPlayerInfoById={randomPlayerData}
        ></ReadingDisplay>
        <hr />
        <h1 className="title">PlayerList</h1>
        <PlayerList
          players={this.state.testData.players}
          extraCssClasses="ld ld-bounce"
        ></PlayerList>
      </div>
    );
  }
}
