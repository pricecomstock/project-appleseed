import React, { Component } from "react";
import classNames from "classnames";
import { prettyCustomPromptSetId } from "../../util/stringFilter";

export default class Options extends Component {
  state = {
    customPromptSetCode: "",
  };

  loadCustomPromptSet = () => {
    this.props.loadCustomPromptSet(this.state.customPromptSetCode);
  };

  updateOptions = () => {
    this.props.updateOptions();
  };

  buttonColorClasses = [
    "red",
    "orange",
    "green",
    "blue",
    "yellow",
    "teal",
    "violet",
  ];

  getButtonColorFromCycle(index) {
    return this.buttonColorClasses[index % this.buttonColorClasses.length];
  }

  render() {
    return (
      <div className="container">
        {/* Game Rule Sets */}
        <div className="game-panel">
          <h2>Game Rule Set</h2>
          <div>
            {this.props.optionSets.map((optionSet, index) => {
              return (
                <button
                  className={classNames(
                    "color-transition",
                    "game-button",
                    this.getButtonColorFromCycle(index),
                    {
                      "perma-hovered":
                        optionSet.name === this.props.currentOptionSet.name,
                    }
                  )}
                  key={index}
                  onClick={() => this.props.updateOptionSet(optionSet.name)}
                >
                  {optionSet.name}
                </button>
              );
            })}
          </div>
          <p>
            <strong>{this.props.currentOptionSet.name}</strong> -{" "}
            {this.props.currentOptionSet.description}
          </p>
        </div>
        {/* Custom Prompts */}
        <div className="game-panel flex-level">
          <div>
            <input
              type="text"
              value={this.state.customPromptSetCode}
              placeholder="AAAA-AAAA-AAAA-AAAA"
              onChange={(e) =>
                this.setState({
                  customPromptSetCode: e.target.value.toUpperCase(),
                })
              }
            ></input>
            <button
              className="game-button blue"
              onClick={this.loadCustomPromptSet}
            >
              Load Custom Prompt Set
            </button>
          </div>
          {this.props.loadedCustomSetData && (
            <div>
              <div>
                Code:{" "}
                {prettyCustomPromptSetId(this.props.loadedCustomSetData.code)}
              </div>
              <div>{this.props.loadedCustomSetData.name}</div>
              <div>{this.props.loadedCustomSetData.description}</div>
              <div>
                Unused Prompts: {this.props.loadedCustomSetData.numRemaining}
              </div>
            </div>
          )}
        </div>
        {/* <button className="button" onClick={this.updateOptions}>
            Update Options
          </button> */}
      </div>
    );
  }
}
