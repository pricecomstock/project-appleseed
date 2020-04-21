import React, { Component } from "react";

export default class ReadingDisplay extends Component {
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
                      <span className="tag is-success is-light is-large">
                        +{" "}
                        {this.props.scoringDetails &&
                          this.props.scoringDetails.pointsArray[answerIndex]}
                      </span>
                      {this.props.scoringDetails.isShutout &&
                        this.props.scoringDetails.shutoutIndex ===
                          answerIndex && (
                          <span className="tag is-success is-large">
                            + {this.props.scoringDetails.shutoutPoints} for
                            shutout!
                          </span>
                        )}
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
