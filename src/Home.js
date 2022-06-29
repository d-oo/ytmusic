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
  const [loopMusic, setLoopMusic] = useState(false);
  const [loopPlaylist, setLoopPlaylist] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [shuffleList, setShuffleList] = useState([]);
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

  useEffect(() => {
    if (dbState === undefined || playingPlaylistId === "") {
      return;
    }
    const arr = [];
    const musicList =
      playlistResult[
        playlistResult.findIndex((i) => i.id === Number(playingPlaylistId))
      ].musicId;
    musicList.forEach((item, index) => {
      const musicInfoReq = db.current
        .transaction("music", "readonly")
        .objectStore("music")
        .get(item);
      musicInfoReq.onsuccess = () => {
        arr.push(musicInfoReq.result);
        if (index === musicList.length - 1) {
          setPlayingPlaylist(arr);
          setVideoOn(true);
        }
      };
    });
  }, [dbState, playlistResult, playingPlaylistId]);

  useEffect(() => {
    if (dbState === undefined || playingMusicId === "") {
      return;
    }
    const transaction = db.current
      .transaction("music", "readwrite")
      .objectStore("music");
    const musicInfoReq = transaction.get(Number(playingMusicId));
    musicInfoReq.onsuccess = () => {
      const result = musicInfoReq.result;
      setTitle(result.title);
      setPlayingVideoId(result.videoId);
      setVideoOn(true);
      transaction.put({
        title: result.title,
        artist: result.artist,
        videoId: result.videoId,
        category: result.category,
        tag: result.tag,
        duration: result.duration,
        playCount: result.playCount + 1,
        recentPlay: Date.now(),
        id: result.id,
      });
    };
  }, [dbState, playingMusicId]);

  const playSingle = useCallback((musicId) => {
    setPlayingMusicId(musicId);
    setPlayingPlaylist([]);
    setPlayingPlaylistId("");
  }, []);

  const playPlaylist = useCallback((musicId, listId) => {
    setPlayingPlaylistId(listId);
    setPlayingMusicId(musicId);
  }, []);

  const playOtherInList = useCallback(
    (target) => {
      const currentIndex = playingPlaylist.findIndex(
        (i) => i.id === Number(playingMusicId)
      );
      switch (target) {
        case "next":
          const nextIndex = currentIndex + 1;
          if (playingPlaylist.length > nextIndex) {
            setPlayingMusicId(String(playingPlaylist[nextIndex].id));
          } else {
            if (!loopPlaylist) {
              setPlayingPlaylist([]);
              setPlayingPlaylistId("");
            }
            console.log("when index exceed");
          }
          break;
        default:
          console.log("etc");
      }
    },
    [playingPlaylist, playingMusicId, loopPlaylist]
  );

  const secondToTime = useCallback((totalSecond) => {
    let h = Math.floor(totalSecond / 3600);
    let m = Math.floor((totalSecond % 3600) / 60);
    let s = totalSecond % 60;
    return (
      (h === 0 ? "" : String(h).padStart(2, "0") + ":") +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  }, []);

  useEffect(() => console.log("dbState Changed"), [dbState]);

  return (
    <AppContext.Provider
      value={{
        playSingle,
        playPlaylist,
        playOtherInList,
        secondToTime,
        playingMusicId,
        setPlayingMusicId,
        playingVideoId,
        setPlayingVideoId,
        playingPlaylist,
        setPlayingPlaylist,
        playingPlaylistId,
        setPlayingPlaylistId,
        loopMusic,
        setLoopMusic,
        loopPlaylist,
        setLoopPlaylist,
        shuffle,
        setShuffle,
        shuffleList,
        setShuffleList,
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
