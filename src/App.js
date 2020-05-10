import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import "./mvp.css";
import "./appleseed.scss";
import "@loadingio/loading.css/dist/loading.css"; // TODO use min
import "@loadingio/transition.css/dist/transition.css"; // TODO use min
import "pattern.css";

import Home from "./components/pages/Home";
import HostView from "./components/pages/HostView";
import PlayerView from "./components/pages/PlayerView";
import CustomPrompts from "./components/pages/CustomPromptsView";
import TestView from "./components/pages/TestView";

function App() {
  return (
    <Router>
      <div className="">
        {/* notice "exact" */}
        <Switch>
          <Route exact path="/" component={Home}></Route>

          <Route exact path="/host/:code" component={HostView}></Route>
          <Route exact path="/play/:code" component={PlayerView}></Route>
          <Route path="/customprompts" component={CustomPrompts}></Route>
          <Route path="/testpage" component={TestView}></Route>
          <Route
            path="/:code"
            render={(routeProps) => (
              <Redirect to={`/play/${routeProps.match.params.code}`}></Redirect>
            )}
          ></Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
