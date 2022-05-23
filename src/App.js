import { useState, createContext } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Player from "./components/Player.js";
import YT from "./components/YT.js";
import styles from "./App.module.css";

export const AppContext = createContext();
function App() {
  const [videoId, setVideoId] = useState("");
  const [player, setPlayer] = useState({});
  const [showInfo, setShowInfo] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [title, setTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  return (
    <AppContext.Provider
      value={{
        videoId,
        setVideoId,
        player,
        setPlayer,
        showInfo,
        setShowInfo,
        videoOn,
        setVideoOn,
        title,
        setTitle,
        isPlaying,
        setIsPlaying,
      }}
    >
      <Router>
        <Switch>
          <Route path="/yt">
            <div
              id={styles.container}
              onContextMenu={(event) => event.preventDefault()}
            >
              <div id={styles.player}>
                <Player />
              </div>
              <div id={styles.playLists}>PlayLists</div>
              <div id={styles.main}>
                <div className={showInfo ? styles.hide : null}>
                  <YT />
                </div>
                <div>
                  <div>Other</div>
                </div>
              </div>
            </div>
          </Route>
          <Route path="/">
            <div
              id={styles.container}
              onContextMenu={(event) => event.preventDefault()}
            >
              <div id={styles.player}>
                <Player />
              </div>
              <div id={styles.playLists}>PlayLists</div>
              <div id={styles.main}>
                <div className={showInfo ? styles.hide : null}>
                  <YT />
                </div>
                <div>
                  <div>Search</div>
                </div>
              </div>
            </div>
          </Route>
        </Switch>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
