import React from "react";
import { useState } from "react";

import C from "../../constants";

export default function Prompt(props) {
  const [answer, setAnswer] = useState("");

  let submit = () => {
    if (answer.length > 0) {
      props.submitAnswer(props.prompt.id, answer);
      setAnswer("");
    }
  };

  let answerForMe = () => {
    props.answerForMe(props.prompt.id);
    setAnswer("");
  };

  return (
    <div className="game-panel player-interactive-panel">
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
      <div className="flex-level shrink">
        <div>
          <button className="game-button green" onClick={submit}>
            Submit
          </button>
          <span className="inline-info">
            prompt {props.promptIndex + 1} of {props.totalPrompts}
          </span>
        </div>
        <button className="mini-button yellow" onClick={answerForMe}>
          idk lol
        </button>
      </div>
    </div>
  );
}
