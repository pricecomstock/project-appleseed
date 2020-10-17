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
        <div>
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
        <div className="flex-level">
          <div className="field has-addons">
            <div className="control">
              <input
                type="text"
                className="input"
                value={this.state.customPromptSetCode}
                placeholder="AAAA-AAAA-AAAA-AAAA"
                onChange={(e) =>
                  this.setState({
                    customPromptSetCode: e.target.value.toUpperCase(),
                  })
                }
              ></input>
            </div>
            <div className="control">
              <button
                className="button is-info"
                onClick={this.loadCustomPromptSet}
              >
                Load Custom Prompt Set
              </button>
            </div>
          </div>
          <div className="level-item">
            Code: {prettyCustomPromptSetId(this.props.loadedCustomSetData.code)}
          </div>
          <div className="level-item">
            {this.props.loadedCustomSetData.name}
          </div>
          <div className="level-item">
            {this.props.loadedCustomSetData.description}
          </div>
          <div className="level-item">
            Unused Prompts: {this.props.loadedCustomSetData.numRemaining}
          </div>
        </div>
        {/* <button className="button" onClick={this.updateOptions}>
            Update Options
          </button> */}
      </div>
    );
  }
}
