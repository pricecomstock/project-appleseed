import React, { Component } from "react";
import AnswerCard from "./AnswerCard";

export default class ReadingDisplay extends Component {
  textClass = () => {
    if (this.props.prompt.answers) {
      if (this.props.prompt.answers.length < 4) {
        return ["is-size-3"];
      } else if (this.props.prompt.answers.length < 8) {
        return ["is-size-4"];
      } else {
        return ["is-size-5"];
      }
    } else {
      return ["is-size-4"];
    }
  };

  render() {
    return (
      <div>
        <div className="hero is-dark">
          <div className="hero-body">
            <div className="container has-text-centered">
              <h1 className="is-size-1">{this.props.prompt.text}</h1>
            </div>
            <div className="container">
              <div className="reading-answers-view">
                {this.props.prompt.answers &&
                  this.props.prompt.answers.map((answer, answerIndex) => {
                    return (
                      <AnswerCard
                        key={answerIndex}
                        text={answer[1]}
                        playerData={this.props.getPlayerInfoById(answer[0])}
                        votingIsComplete={this.props.votingIsComplete}
                        basePoints={
                          this.props.scoringDetails.pointsArray[answerIndex]
                        }
                        isShutout={
                          this.props.scoringDetails.isShutout &&
                          this.props.scoringDetails.shutoutIndex === answerIndex
                        }
                        shutoutPoints={this.props.scoringDetails.shutoutPoints}
                        voters={this.props.votingResults
                          .filter((entry) => {
                            return entry[1] === answerIndex;
                          })
                          .map((entry) => {
                            this.props.getPlayerInfoById(entry[0]);
                          })} // FIXME performance?
                      ></AnswerCard>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
