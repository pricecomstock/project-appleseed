import React, { Component } from "react";

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
      <div>
        <p className="label">Custom Prompt Set</p>
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
              Load
            </button>
          </div>
          {JSON.stringify(this.props.customSetData)}
        </div>
        {/* <button className="button" onClick={this.updateOptions}>
          Update Options
        </button> */}
      </div>
    );
  }
}
