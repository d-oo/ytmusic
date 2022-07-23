import { useState, useEffect, useCallback, useRef, createContext } from "react";
import { Outlet } from "react-router-dom";
import Player from "./components/Player";
import YT from "./components/YT";
import Alert from "./components/Alert";
import Playlists from "./components/Playlists";

import styles from "./Home.module.css";

export const AppContext = createContext();

export default function Home() {
  //scroll
  const [searchScroll, setSearchScroll] = useState(0);
  const [handlePlaylistScroll, setHandlePlaylistScroll] = useState(null);
  //player
  const [playingMusicId, setPlayingMusicId] = useState("");
  const [playingMusicInfo, setPlayingMusicInfo] = useState("");
  const [playingPlaylist, setPlayingPlaylist] = useState([]);
  const [playingPlaylistId, setPlayingPlaylistId] = useState("");
  const [loopMusic, setLoopMusic] = useState(false);
  const [loopPlaylist, setLoopPlaylist] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [shuffleList, setShuffleList] = useState([]);
  const [player, setPlayer] = useState("");
  const [videoOn, setVideoOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMute, setIsMute] = useState(false);
  const [volume, setVolume] = useState(50);
  const playingMusicIdRef = useRef("");
  //showHandle
  const [showYT, setShowYT] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  //db
  const [playlistResult, setPlaylistResult] = useState([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const [dbState, setDbState] = useState();
  const db = useRef();

  useEffect(() => {
    setVolume(Number(window.localStorage.getItem("volume")));
    setIsMute(JSON.parse(window.localStorage.getItem("mute")));
    const dbReq = indexedDB.open("database", 1);
    dbReq.onsuccess = (event) => {
      db.current = event.target.result;
      setDbState(event.target.result);
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
        }
      };
    });
  }, [dbState, playlistResult, playingPlaylistId]);

  useEffect(() => {
    if (dbState === undefined || playingMusicId === "") {
      return;
    }
    playingMusicIdRef.current = playingMusicId;
    const transaction = db.current
      .transaction("music", "readwrite")
      .objectStore("music");
    const musicInfoReq = transaction.get(Number(playingMusicId));
    musicInfoReq.onsuccess = () => {
      const result = musicInfoReq.result;
      setPlayingMusicInfo(result);
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

  useEffect(() => {
    if (shuffle) {
      if (playingPlaylist.length === 0) {
        return;
      }
      const array = [...playingPlaylist];
      let len = array.length,
        t,
        i;
      while (len) {
        i = Math.floor(Math.random() * len--);
        t = array[len];
        array[len] = array[i];
        array[i] = t;
      }
      const tmpIndex = array.findIndex(
        (i) => i.id === Number(playingMusicIdRef.current)
      );
      t = array[tmpIndex];
      array[tmpIndex] = array[0];
      array[0] = t;
      setShuffleList(array);
    } else {
      setShuffleList([]);
    }
  }, [shuffle, playingPlaylist]);

  const playSingle = useCallback((musicId) => {
    setPlayingMusicId(musicId);
    setPlayingPlaylist([]);
    setPlayingPlaylistId("");
    setLoopPlaylist(false);
    setLoopMusic(false);
    setShuffle(false);
    setShuffleList([]);
  }, []);

  const playPlaylist = useCallback(
    (musicId, listId) => {
      if (playingPlaylistId !== listId) {
        setLoopPlaylist(false);
      }
      setPlayingMusicId(musicId);
      setPlayingPlaylistId(listId);
      setLoopMusic(false);
      setShuffle(false);
      setShuffleList([]);
    },
    [playingPlaylistId]
  );

  const playShuffle = useCallback((listId, musicArr) => {
    const randomMusic = musicArr[Math.floor(Math.random() * musicArr.length)];
    setPlayingMusicId(String(randomMusic));
    setLoopPlaylist(false);
    setLoopMusic(false);
    setPlayingPlaylistId(listId);
    setShuffle(true);
  }, []);

  const playNext = useCallback(() => {
    let arr;
    setLoopMusic(false);
    if (shuffle) {
      arr = shuffleList;
    } else {
      arr = playingPlaylist;
    }
    const currentIndex = arr.findIndex((i) => i.id === Number(playingMusicId));
    if (currentIndex < arr.length - 1) {
      setPlayingMusicId(String(arr[currentIndex + 1].id));
    } else if (loopPlaylist) {
      setPlayingMusicId(String(arr[0].id));
    } else {
      setPlayingPlaylist([]);
      setPlayingPlaylistId("");
      setShuffle(false);
      setShuffleList([]);
    }
  }, [playingPlaylist, playingMusicId, loopPlaylist, shuffle, shuffleList]);

  const playPrev = useCallback(() => {
    let arr;
    setLoopMusic(false);
    if (shuffle) {
      arr = shuffleList;
    } else {
      arr = playingPlaylist;
    }
    const currentIndex = arr.findIndex((i) => i.id === Number(playingMusicId));
    if (currentIndex > 0) {
      setPlayingMusicId(String(arr[currentIndex - 1].id));
    } else if (loopPlaylist) {
      setPlayingMusicId(String(arr[arr.length - 1].id));
    }
  }, [playingPlaylist, playingMusicId, loopPlaylist, shuffle, shuffleList]);

  const secondToTime = useCallback((totalSecond) => {
    if (isNaN(totalSecond)) {
      return "00:00";
    }
    let h = Math.floor(totalSecond / 3600);
    let m = Math.floor((totalSecond % 3600) / 60);
    let s = Math.floor(totalSecond % 60);
    return (
      (h === 0 ? "" : String(h).padStart(2, "0") + ":") +
      String(m).padStart(2, "0") +
      ":" +
      String(s).padStart(2, "0")
    );
  }, []);

  const alertFor = useCallback((message) => {
    setShowAlert(true);
    setAlertMessage(message);
  }, []);

  return (
    <AppContext.Provider
      value={{
        searchScroll,
        setSearchScroll,
        handlePlaylistScroll,
        setHandlePlaylistScroll,
        playSingle,
        playPlaylist,
        playShuffle,
        playNext,
        playPrev,
        secondToTime,
        alertFor,
        playingMusicId,
        setPlayingMusicId,
        playingMusicInfo,
        setPlayingMusicInfo,
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
        isMute,
        setIsMute,
        volume,
        setVolume,
        showYT,
        setShowYT,
        showAlert,
        setShowAlert,
        videoOn,
        setVideoOn,
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
        onContextMenu={(event) => event.preventDefault()}
      >
        <div id={styles.player}>
          <Player />
        </div>
        <div id={styles.playlists}>
          <Playlists />
        </div>
        <div id={styles.mainContent}>
          <Alert message={alertMessage} />
          <YT />
          <Outlet />
        </div>
      </div>
    </AppContext.Provider>
  );
}
