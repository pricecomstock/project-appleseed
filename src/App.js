import React from "react";
import "./mvp.css";
import "./appleseed.scss";

function App() {
  return (
    <div className="App container">
      <header>
        <h1 className="title">Project Appleseed</h1>
      </header>
      <div class="field has-addons">
        <div class="control">
          <input class="input" type="text" placeholder="Room code" />
        </div>
        <div class="control">
          <button class="button is-info">Join</button>
        </div>
      </div>
    </div>
  );
}

export default App;
