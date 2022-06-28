import { useState, useEffect, useCallback, useRef, createContext } from "react";
import { Outlet } from "react-router-dom";
import Player from "./components/Player";
import YT from "./components/YT";
import Playlists from "./components/Playlists";

import styles from "./Home.module.css";

export const AppContext = createContext();

export default function Home() {
  //player
  const [playingMusicId, setPlayingMusicId] = useState("");
  const [playingVideoId, setPlayingVideoId] = useState("");
  const [playingPlaylist, setPlayingPlaylist] = useState([]);
  const [playingPlaylistId, setPlayingPlaylistId] = useState("");
  const [title, setTitle] = useState("");
  const [player, setPlayer] = useState({});
  const [videoOn, setVideoOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  //showHandle
  const [showYT, setShowYT] = useState(false);
  //db
  const [playlistResult, setPlaylistResult] = useState([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const [dbState, setDbState] = useState();
  const db = useRef();

  useEffect(() => {
    const dbReq = indexedDB.open("database", 1);
    dbReq.onsuccess = (event) => {
      db.current = event.target.result;
      setDbState(event.target.result);
    };

    dbReq.onerror = (event) => {
      console.log("error", event.target.error.name);
    };

    dbReq.onupgradeneeded = (event) => {
      db.current = event.target.result;
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
        objStore.createIndex("musicId", "musicId", { multiEntry: true });
      }
    };
  }, []);

  const playSingle = useCallback((musicId, videoId, title) => {
    setPlayingMusicId(musicId);
    setPlayingVideoId(videoId);
    setTitle(title);
    setVideoOn(true);
    setPlayingPlaylist([]);
    setPlayingPlaylistId("");
  }, []);

  const playPlaylist = useCallback(
    (musicId, listId) => {
      const arr = [];
      const musicList =
        playlistResult[playlistResult.findIndex((i) => i.id === Number(listId))]
          .musicId;
      console.log(musicList);
      musicList.forEach((item, index) => {
        const musicInfoReq = db.current
          .transaction("music", "readonly")
          .objectStore("music")
          .get(item);
        musicInfoReq.onsuccess = () => {
          arr.push(musicInfoReq.result);
          if (index === musicList.length - 1) {
            setPlayingPlaylistId(listId);
            setPlayingPlaylist(arr);
            setPlayingMusicId(musicId);
            setPlayingVideoId(
              arr[arr.findIndex((i) => i.id === Number(musicId))].videoId
            );
            setTitle(arr[arr.findIndex((i) => i.id === Number(musicId))].title);
            setVideoOn(true);
          }
        };
      });
    },
    [playlistResult]
  );

  const playOtherInList = useCallback(
    (target) => {
      switch (target) {
        case "next":
          console.log("asdf");
          console.log(playingPlaylist);
          break;
        default:
          console.log("etc");
      }
    },
    [playingPlaylist]
  );

  useEffect(() => console.log("dbState Changed"), [dbState]);
  return (
    <AppContext.Provider
      value={{
        playSingle,
        playPlaylist,
        playOtherInList,
        playingMusicId,
        setPlayingMusicId,
        playingVideoId,
        setPlayingVideoId,
        playingPlaylist,
        setPlayingPlaylist,
        playingPlaylistId,
        setPlayingPlaylistId,
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
