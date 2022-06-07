import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import styles from "./MusicSearchResult.module.css";

export default function MusicSearchResult({ info, index }) {
  const { setShowInfo, setInfoId, setVideoId, setVideoOn, setTitle, dbState } =
    useContext(AppContext);
  const [result, setResult] = useState([]);
  const db = useRef();
  const resultRef = useRef();

  useEffect(() => {
    db.current = dbState;
  }, [dbState]);

  const onClickOutside = (event) => {
    if (result.length !== 0 && !resultRef.current.contains(event.target)) {
      setResult([]);
    }
  };

  useEffect(() => {
    if (result.length === 0) {
      return;
    }
    window.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("click", onClickOutside);
    };
  });

  const getPlaylists = () => {
    const getAllReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .getAll();
    getAllReq.onsuccess = () => {
      setResult(getAllReq.result);
    };
  };

  const addToPlaylist = (playlistInfo) => {
    const updateReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistInfo.title,
        musicId: [...playlistInfo.musicId, info.videoId],
        totalDuration: playlistInfo.totalDuration,
        videoCount: playlistInfo.videoCount,
        id: playlistInfo.id,
      });
    updateReq.onsuccess = () => {
      console.log("succefully updated!");
      setResult([]);
    };
  };

  return (
    <div>
      <div id={styles.flexContainer}>
        <img
          alt={index}
          src={`https://i.ytimg.com/vi/${info.videoId}/mqdefault.jpg`}
          width="128"
          height="72"
        />
        <div id={styles.titleDiv}>{info.title}</div>
        <div id={styles.artistDiv}>{info.artist.join(", ")}</div>
        <div id={styles.infoDiv}>
          <span
            className="material-icons-round"
            onClick={() => {
              setInfoId(info.videoId);
              setShowInfo(true);
            }}
          >
            info_outline
          </span>
        </div>
        <div id={styles.playDiv}>
          <span
            className="material-icons-round"
            onClick={() => {
              setVideoId(info.videoId);
              setVideoOn(true);
              setTitle(info.title);
            }}
          >
            play_arrow
          </span>
        </div>
        <div id={styles.addToDiv}>
          <span
            className="material-icons-round"
            onClick={() => {
              if (result.length !== 0) {
                return;
              }
              getPlaylists();
            }}
          >
            playlist_add
          </span>
          <div id={styles.wrapper} ref={resultRef}>
            <div id={styles.results}>
              {result.map((item, index) => (
                <div
                  key={index}
                  className={styles.result}
                  onClick={() => addToPlaylist(item)}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
