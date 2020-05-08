import React, { Component } from "react";
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

  render() {
    return (
      <div className="container">
        <div className="level">
          <div className="level-left">
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
          </div>
          <div className="level-right">
            <div className="level-item">
              Code:{" "}
              {prettyCustomPromptSetId(this.props.loadedCustomSetData.code)}
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
        </div>
        {/* <button className="button" onClick={this.updateOptions}>
            Update Options
          </button> */}
      </div>
    );
  }
}
