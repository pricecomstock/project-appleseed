import React, { Component } from "react";
import UploadPrompts from "../customPrompts/UploadPrompts";
import EditCustomSet from "../customPrompts/EditCustomSet";
import { Link } from "react-router-dom";
import classNames from "classnames";

const modes = {
  BULKUPLOAD: "bulk",
  EDIT: "edit",
};

const homeTheme = {
  backgroundStyles: {
    backgroundColor: "#7272ac",
    color: "#606092",
  },
  textColor: "#000",
  backgroundClasses: "pattern-diagonal-stripes-xl",
};

export default class CustomPrompts extends Component {
  state = {
    mode: modes.BULKUPLOAD,
  };
  render() {
    return (
      <div
        className={classNames("fun-bg", homeTheme.backgroundClasses)}
        style={homeTheme.backgroundStyles}
      >
        <div className="logo-center-container">
          <Link to="/">
            <img
              className="margin-center"
              width="300px"
              src="logo.svg"
              alt="Bitwits!"
            />
          </Link>
        </div>
        <div className="game-panel custom-prompts-home-box">
          <div className="tabs is-centered is-large">
            <ul>
              <li
                className={classNames({
                  "is-active": this.state.mode === modes.BULKUPLOAD,
                })}
                onClick={() => this.setState({ mode: modes.BULKUPLOAD })}
              >
                <a>Bulk Upload</a>
              </li>
              <li
                className={classNames({
                  "is-active": this.state.mode === modes.EDIT,
                })}
                onClick={() => this.setState({ mode: modes.EDIT })}
              >
                <a>View/Export</a>
              </li>
            </ul>
          </div>
          {this.state.mode === modes.BULKUPLOAD && (
            <UploadPrompts></UploadPrompts>
          )}
          {this.state.mode === modes.EDIT && <EditCustomSet></EditCustomSet>}
        </div>
      </div>
    );
  }
}
