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
          ? "all answer each"
          : currentRoundOptions.answersPerPrompt + " answer each";
    }

    return (
      <div className="game-panel flex-center-text options-hud">
        <p>
          Round {this.props.currentRoundIndex + 1}/
          {this.props.options.rounds && this.props.options.rounds.length}, x
          {currentRoundOptions && currentRoundOptions.pointMultiplier} pt
        </p>
        <p>
          {currentRoundOptions && currentRoundOptions.promptsPerPlayer}Q,{" "}
          {answerString}
        </p>
      </div>
    );
  }
}
