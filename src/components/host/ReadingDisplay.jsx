import React, { Component } from "react";

export default class ReadingDisplay extends Component {
  state = {
    pointsPerPrompt: 800,
    pointsForShutout: 200,
    pointsArray: [],
    // TODO shutout index
  };

  componentDidMount() {
    this.calculatePoints(); // this needs to be done more!
  }

  calculatePoints() {
    let votePairs = Object.entries(this.props.votingResults);
    let pointsPerVote = this.state.pointsPerPrompt / votePairs.length;
    let pointsArray = [];
    votePairs.map((entry) => {
      let voteIndex = entry[1];
      if (!pointsArray[voteIndex]) {
        pointsArray[voteIndex] = 0;
      }
      pointsArray[voteIndex] += pointsPerVote;
    });

    if (
      pointsArray.filter((points) => {
        return points && points > 0;
      }).length == 1
    ) {
      let shutoutIndex = pointsArray.findIndex((points) => {
        return points && points > 0;
      });

      pointsArray[shutoutIndex] += this.pointsForShutout;
    }

    this.setState({ pointsArray: pointsArray });
  }

  calculatePointsPoorly() {
    let votePairs = Object.entries(this.props.votingResults);
    let pointsPerVote = this.state.pointsPerPrompt / votePairs.length;
    let pointsArray = [];
    votePairs.map((entry) => {
      let voteIndex = entry[1];
      if (!pointsArray[voteIndex]) {
        pointsArray[voteIndex] = 0;
      }
      pointsArray[voteIndex] += pointsPerVote;
    });

    if (
      pointsArray.filter((points) => {
        return points && points > 0;
      }).length == 1
    ) {
      let shutoutIndex = pointsArray.findIndex((points) => {
        return points && points > 0;
      });

      pointsArray[shutoutIndex] += this.pointsForShutout;
    }

    return pointsArray;
  }

  render() {
    return (
      <div>
        <h1 className="title">{this.props.prompt.text}</h1>
        {/* <p>{this.props.prompt.id}</p> */}
        <div className="columns is-centered is-multiline">
          {this.props.prompt.answers &&
            this.props.prompt.answers.map((answer, answerIndex) => {
              return (
                <div className="column is-one-third">
                  <div className="box">
                    <h1 className="title">{answer[1]}</h1>
                    {/* <span className="tag is-light is-small">{answer[0]}</span> */}
                  </div>
                  {this.props.votingIsComplete && (
                    <div>
                      <span className="tag is-success is-large">
                        +{" "}
                        {Math.round(this.calculatePointsPoorly()[answerIndex])}
                      </span>
                      <div className="tags">
                        {Object.entries(this.props.votingResults).map(
                          (entry) => {
                            let playerId = entry[0];
                            let voteIndex = entry[1];

                            if (voteIndex === answerIndex) {
                              return (
                                <span className="tag is-info is-medium is-light">
                                  {/* FIXME this is probably very bad performance */}
                                  {this.props.getPlayerInfoById(playerId).emoji}
                                  &nbsp;
                                  {
                                    this.props.getPlayerInfoById(playerId)
                                      .nickname
                                  }
                                </span>
                              );
                            }
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }
}
