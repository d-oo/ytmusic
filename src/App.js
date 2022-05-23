import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/yt">
          <Home component="Other" />
        </Route>
        <Route path="/">
          <Home component="Search" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
