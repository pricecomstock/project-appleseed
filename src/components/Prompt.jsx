import React from "react";
import { useState } from "react";

export default function Prompt(props) {
  const [answer, setAnswer] = useState("");

  const submitPrompt = () => {
    // TODO
  };
  return (
    <div>
      <p className="is-size-4">{props.prompt}</p>
      <div className="field">
        <label className="label">Answer</label>
        <div className="control">
          <input
            className="input"
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
          />
        </div>
      </div>
      <button className="button is-primary" onClick={submitPrompt}>
        Submit
      </button>
    </div>
  );
}
