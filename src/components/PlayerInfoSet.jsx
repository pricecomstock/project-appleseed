import React from "react";
import PropTypes from "prop-types";
import { useState } from "react";

export default function PlayerInfoSet() {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("😀");

  return (
    <div>
      <div className="field">
        <label className="label">Name</label>
        <div className="control">
          <input
            className="input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">emoji</label>
        <div className="control">
          <input
            className="input"
            type="emoji"
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
          />
        </div>
      </div>
      <button className="button is-primary">Update</button>
    </div>
  );
}
