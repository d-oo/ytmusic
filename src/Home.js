import { useState, createContext } from "react";
import Player from "./components/Player";
import MusicInfo from "./components/MusicInfo";
import AddMusic from "./components/AddMusic";

import styles from "./Home.module.css";

export const AppContext = createContext();

function Home({ component }) {
  const [videoId, setVideoId] = useState("");
  const [player, setPlayer] = useState({});
  const [showInfo, setShowInfo] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [title, setTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const components = {
    Search: <div>Search</div>,
    Other: <div>Other</div>,
    AddMusic: <AddMusic />,
  };

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
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <div
        id={styles.container}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div id={styles.player}>
          <Player />
        </div>
        <div id={styles.playlists}>Playlists</div>
        <div id={styles.main}>
          <MusicInfo musicId={videoId} />
          <div>{components[component]}</div>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default Home;
