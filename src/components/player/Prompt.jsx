import React from "react";
import { useState } from "react";

import C from "../../constants";

export default function Prompt(props) {
  const [answer, setAnswer] = useState("");

  let submit = () => {
    props.submitAnswer(props.prompt.id, answer);
    setAnswer("");
  };

  return (
    <div className="game-panel">
      <div>
        <p className="player-prompt-text">{props.prompt.text}</p>
      </div>

      <div className="field">
        <label className="label">Answer</label>
        <div className="control">
          <input
            className="input"
            type="text"
            value={answer}
            onChange={(event) =>
              setAnswer(event.target.value.substring(0, C.MAX_ANSWER_CHARS))
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                submit();
              }
            }}
          />
        </div>
      </div>
      <button className="button is-primary" onClick={submit}>
        Submit
      </button>
    </div>
  );
}
