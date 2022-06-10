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
  //player
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [player, setPlayer] = useState({});
  const [videoOn, setVideoOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  //modal handle
  const [showMusicInfo, setShowMusicInfo] = useState(() => {});
  const [showYT, setShowYT] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(() => {});
  const [infoId, setInfoId] = useState("");
  const [playlistInfoId, setPlaylistInfoId] = useState("");
  const [playlistResult, setPlaylistResult] = useState([]);
  //db
  const [isUpdated, setIsUpdated] = useState(true); //false or true?
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

  // useEffect(() => {
  //   if (infoId === videoId && showInfo) {
  //     setShowYT(true);
  //   } else {
  //     setShowYT(false);
  //   }
  // }, [infoId, videoId, showInfo]);
  // info와 yt를 같이 보이게 하는 코드

  return (
    <AppContext.Provider
      value={{
        videoId,
        setVideoId,
        player,
        setPlayer,
        showMusicInfo,
        setShowMusicInfo,
        showYT,
        setShowYT,
        showPlaylist,
        setShowPlaylist,
        infoId,
        setInfoId,
        playlistInfoId,
        setPlaylistInfoId,
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
        <div id={styles.main}>
          <YT />
          <MusicInfo />
          <PlaylistInfo />
          {components[component]}
        </div>
      </div>
    </AppContext.Provider>
  );
}
