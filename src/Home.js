import { useState, useEffect, useRef, createContext } from "react";
import Player from "./components/Player";
import YT from "./components/YT";
import MusicInfo from "./components/MusicInfo";
import SearchMusic from "./components/SearchMusic";
import Playlists from "./components/Playlists";
import PlaylistInfo from "./components/PlaylistInfo";

import styles from "./Home.module.css";

export const AppContext = createContext();

export default function Home({ component }) {
  const [videoId, setVideoId] = useState("");
  const [player, setPlayer] = useState({});
  const [showInfo, setShowInfo] = useState(false);
  const [showYT, setShowYT] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [videoOn, setVideoOn] = useState(false);
  const [title, setTitle] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [infoId, setInfoId] = useState("");
  const [playlistId, setPlaylistId] = useState("");
  const [dbState, setDbState] = useState();
  const db = useRef();

  const components = {
    SearchMusic: <SearchMusic />,
    Other: <div>Other</div>,
  };

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
    if (infoId === videoId && showInfo) {
      setShowYT(true);
    } else {
      setShowYT(false);
    }
  }, [infoId, videoId, showInfo]);

  return (
    <AppContext.Provider
      value={{
        videoId,
        setVideoId,
        player,
        setPlayer,
        showInfo,
        setShowInfo,
        showYT,
        setShowYT,
        showPlaylist,
        setShowPlaylist,
        infoId,
        setInfoId,
        playlistId,
        setPlaylistId,
        videoOn,
        setVideoOn,
        title,
        setTitle,
        isPlaying,
        setIsPlaying,
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
        <div id={styles.main}>
          <YT />
          <MusicInfo musicId={infoId} />
          <PlaylistInfo playlistId={playlistId} />
          {components[component]}
        </div>
      </div>
    </AppContext.Provider>
  );
}
