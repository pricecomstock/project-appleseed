import React, { Component } from "react";
import axios from "../../axios-backend";

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export default class EditCustomSet extends Component {
  state = {
    customSetCode: "",
    prompts: [],
    metadata: {
      name: "",
      description: "",
    },
  };

  downloadTextFile = () => {
    download(
      `prompts_${this.state.metadata.name}.txt`,
      this.state.prompts.join("\n")
    );
  };

  loadCustomSet = () => {
    // axios
    //   .post("/createroom")
    //   .then((res) => {
    //     console.log(res);
    //     localStorage.setItem(`${res.data.code}_adminKey`, res.data.adminKey);
    //     // this.props.history.push(`/host/${res.data.code}`);
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //   });
    axios
      .get(`loadcustomsetforediting/${this.state.customSetCode}`)
      .then((res) => {
        console.log(res.data);
        this.setState({
          prompts: res.data.prompts,
          metadata: res.data.metadata,
        });
      })
      .catch((err) => console.error(err));
  };

  render() {
    return (
      <div className="custom-prompts-form">
        {this.state.prompts.length === 0 && (
          <div className="flex-level bottom">
            <div
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  this.loadCustomSet();
                }
              }}
            >
              <p>Enter a code to load a prompt set</p>
              <input
                type="text"
                className="custom-prompt-code-entry"
                placeholder="AAAA-AAAA-AAAA-AAAA"
                value={this.state.enteredCode}
                onChange={(e) => {
                  this.setState({
                    customSetCode: e.target.value.substring(0, 25), // TODO idk account for hyphens probably
                  });
                }}
              />
            </div>
            <button className="game-button teal" onClick={this.loadCustomSet}>
              Load Custom Set
            </button>
          </div>
        )}
        {this.state.prompts.length > 0 && (
          <>
            <button
              className="button is-primary is-outlined"
              onClick={this.downloadTextFile}
            >
              Download .txt
            </button>
            <div>
              {this.state.prompts.map((prompt, index) => {
                return <p key={index}>{prompt}</p>;
              })}
            </div>
          </>
        )}
      </div>
    );
  }
}
