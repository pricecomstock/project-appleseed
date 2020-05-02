import React, { Component } from "react";
import axios from "../../axios-backend";

export default class UploadPrompts extends Component {
  state = { promptEntry: "", id: "" };
  submitPrompts = () => {
    axios
      .post("/uploadprompts", {
        promptEntry: this.state.promptEntry,
      })
      .then((res) => {
        let prettyId = res.data.id.replace(/(\w{4}(?!$))/g, "$1-");
        this.setState({ promptEntry: "", id: prettyId });
      })
      .catch((err) => console.error(err));
  };

  render() {
    return (
      <div className="columns is-vcentered is-centered is-desktop">
        <div className="column is-half">
          <div className="field">
            <div className="content">
              <p>Paste prompts in below.</p>
              <ul>
                <li>One prompt per line.</li>
                <li>
                  %p will be replaced with a player's name when it is used in a
                  game.
                </li>
                <li>
                  One underscore is enough and will be expanded into a longer
                  blank.
                </li>
              </ul>
            </div>
            <label className="label">Prompts</label>
            <div className="control">
              <textarea
                value={this.state.promptEntry}
                className="textarea"
                placeholder="Enter one prompt per line."
                onChange={(e) => this.setState({ promptEntry: e.target.value })}
              ></textarea>
            </div>
          </div>
          <button className="button is-primary" onClick={this.submitPrompts}>
            Submit
          </button>
          <hr />
          {this.state.id && (
            <p className="is-size-3">
              Success! Custom promptset code: <span>{this.state.id}</span>
            </p>
          )}
        </div>
      </div>
    );
  }
}
