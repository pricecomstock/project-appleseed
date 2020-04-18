import React from "react";
import PropTypes from "prop-types";
import { useState } from "react";

export default function PlayerInfoSet() {
  return (
    <div>
      <div className="field">
        <label className="label">Name</label>
        <div className="control">
          <input className="input" type="text" />
        </div>
      </div>

      <div className="field">
        <label className="label">emoji</label>
        <div className="control">
          <input className="input" type="emoji" />
        </div>
      </div>
      <button className="button is-primary">Update</button>
    </div>
  );
}
