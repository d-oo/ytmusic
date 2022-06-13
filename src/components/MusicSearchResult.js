import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./MusicSearchResult.module.css";
//start

export default function MusicSearchResult({ info, index }) {
  const {
    setPlayingMusicId,
    setPlayingVideoId,
    setVideoOn,
    setTitle,
    playlistResult,
    dbState,
  } = useContext(AppContext);
  const [showResult, setShowResult] = useState(false);
  const db = useRef();
  const resultRef = useRef(); //DOM Ref
  const navigate = useNavigate();

  useEffect(() => {
    db.current = dbState;
  }, [dbState]);

  useEffect(() => {
    if (!showResult) {
      return;
    }
    const onClickOutside = (event) => {
      if (showResult && !resultRef.current.contains(event.target)) {
        setShowResult(false);
      }
    };
    setTimeout(() => window.addEventListener("click", onClickOutside), 0);
    return () => {
      window.removeEventListener("click", onClickOutside);
    };
  }, [showResult]);

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
      //업데이트 완료 창
      setShowResult(false);
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
              navigate(`/music/${info.id}`);
            }}
          >
            info_outline
          </span>
        </div>
        <div id={styles.playDiv}>
          <span
            className="material-icons-round"
            onClick={() => {
              setPlayingVideoId(info.videoId);
              setPlayingMusicId(String(info.id));
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
              if (showResult) {
                return;
              }
              setShowResult(true);
            }}
          >
            playlist_add
          </span>
          <div id={styles.wrapper} ref={resultRef}>
            {showResult ? (
              <div id={styles.results}>
                {playlistResult.map((item, index) => (
                  <div
                    key={index}
                    className={styles.result}
                    onClick={() => addToPlaylist(item)}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
