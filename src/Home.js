import { useState, useEffect, useRef, createContext } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Player from "./components/Player";
import YT from "./components/YT";
import Playlists from "./components/Playlists";

import styles from "./Home.module.css";

export const AppContext = createContext();

export default function Home() {
  //player
  const [playingMusicId, setPlayingMusicId] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [player, setPlayer] = useState({});
  const [videoOn, setVideoOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  //showHandle
  const [showYT, setShowYT] = useState(false); //false
  const [playlistResult, setPlaylistResult] = useState([]);
  const location = useLocation();
  //db
  const [isUpdated, setIsUpdated] = useState(true); //false or true?
  const [dbState, setDbState] = useState();
  const db = useRef();

  useEffect(() => {
    const dbReq = indexedDB.open("database", 1);
    dbReq.onsuccess = (event) => {
      db.current = event.target.result;
      setDbState(event.target.result);
    };

    dbReq.onerror = (event) => {
      const error = event.target.error;
      console.log("error", error.name);
    };

    dbReq.onupgradeneeded = (event) => {
      db.current = event.target.result;
      setDbState(event.target.result);
      if (event.oldVersion < 1) {
        let objStore = db.current.createObjectStore("music", {
          keyPath: "id",
          autoIncrement: true,
        });
        objStore.createIndex("artist", "artist", {
          multiEntry: true,
        });
        objStore.createIndex("videoId", "videoId", { unique: true });
        objStore.createIndex("category", "category");
        objStore.createIndex("tag", "tag", { multiEntry: true });
        objStore.createIndex("playCount", "playCount");
        objStore.createIndex("recentPlay", "recentPlay");
        objStore = db.current.createObjectStore("playlist", {
          keyPath: "id",
          autoIncrement: true,
        });
        objStore.createIndex("title", "title", { unique: true });
      }
    };
  }, []);

  useEffect(() => {
    const urlArr = location.pathname.split("/");
    if (urlArr[1] === "music" && playingMusicId === urlArr[2]) {
      setShowYT(true);
    } else {
      setShowYT(false);
    }
  }, [location, playingMusicId]);

  return (
    <AppContext.Provider
      value={{
        playingMusicId,
        setPlayingMusicId,
        playingVideoId,
        setPlayingVideoId,
        player,
        setPlayer,
        showYT,
        setShowYT,
        videoOn,
        setVideoOn,
        title,
        setTitle,
        isPlaying,
        setIsPlaying,
        playlistResult,
        setPlaylistResult,
        isUpdated,
        setIsUpdated,
        dbState,
      }}
    >
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        rel="stylesheet"
      />
      <div
        id={styles.container}
        // onContextMenu={(event) => event.preventDefault()}
      >
        <div id={styles.player}>
          <Player />
        </div>
        <div id={styles.playlists}>
          <Playlists />
        </div>
        <div id={styles.mainContent}>
          <YT />
          <Outlet />
        </div>
      </div>
    </AppContext.Provider>
  );
}
