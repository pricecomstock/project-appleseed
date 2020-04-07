import React, { Fragment } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./mvp.css";
import "./appleseed.scss";

import Home from "./components/pages/Home";
import HostView from "./components/pages/HostView";
import PlayerView from "./components/pages/PlayerView";

function App() {
  return (
    <Router>
      <div className="App section">
        {/* notice "exact" */}
        <Route exact path="/" component={Home}></Route>

        <Route exact path="/watch" component={HostView}></Route>
        <Route exact path="/play" component={PlayerView}></Route>
      </div>
    </Router>
  );
}

export default App;
