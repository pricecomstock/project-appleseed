import React, { Component } from "react";
import C from "../../constants";

export default class OptionsHUD extends Component {
  render() {
    let currentRoundOptions =
      this.props.options.rounds &&
      this.props.options.rounds[this.props.currentRoundIndex];
    let answerString = "";
    if (currentRoundOptions) {
      answerString =
        currentRoundOptions.answersPerPrompt ===
        C.ANSWERS_PER_PROMPT_OPTIONS.ALL
          ? "all answer one"
          : currentRoundOptions.answersPerPrompt + " answer each";
    }

    return (
      <div className="game-panel flex-center-text options-hud">
        <p>
          Round {this.props.currentRoundIndex + 1}, x
          {currentRoundOptions && currentRoundOptions.pointMultiplier} pt
        </p>
        <p>{answerString}</p>
      </div>
    );
  }
}
