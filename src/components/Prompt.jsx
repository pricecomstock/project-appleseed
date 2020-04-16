import React from "react";
import { useState } from "react";

export default function Prompt(props) {
  const [answer, setAnswer] = useState("");

  return (
    <div>
      <p className="is-size-4">{props.prompt.text}</p>
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
      <button
        className="button is-primary"
        onClick={() => {
          props.submitAnswer(props.prompt.id, answer);
        }}
      >
        Submit
      </button>
    </div>
  );
}
