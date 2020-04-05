import React from "react";
import logo from "./logo.svg";
import "./mvp.css";

function App() {
  return (
    <div className="App">
      <header>
        <h1>Project Appleseed</h1>
      </header>
      <section>
        <h2>Enter room code:</h2>
        <label for="roomcode">Code:</label>
        <input type="text" id="roomcode" />
      </section>
    </div>
  );
}

export default App;
