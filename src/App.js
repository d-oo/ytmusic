import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";

function App() {
  if (!window.indexedDB) {
    window.alert("IndexedDB not available");
  }
  return (
    <Router>
      <Switch>
        <Route path="/other">
          <Home component="Other" />
        </Route>
        <Route path="/addmusic">
          <Home component="AddMusic" />
        </Route>
        <Route path="/">
          <Home component="Search" />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
