import React, { Component } from "react";
import UploadPrompts from "../customPrompts/UploadPrompts";
import EditCustomSet from "../customPrompts/EditCustomSet";
import classNames from "classnames";

const modes = {
  BULKUPLOAD: "bulk",
  EDIT: "edit",
};

export default class CustomPrompts extends Component {
  state = {
    mode: modes.BULKUPLOAD,
  };
  render() {
    return (
      <div>
        <div className="tabs is-centered is-large">
          <ul>
            <li
              className={classNames({
                "is-active": this.state.mode === modes.BULKUPLOAD,
              })}
              onClick={() => this.setState({ mode: modes.BULKUPLOAD })}
            >
              <a>Bulk</a>
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
    );
  }
}
