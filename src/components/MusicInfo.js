import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";

import styles from "./MusicInfo.module.css";

export default function MusicInfo({ musicId }) {
  const { showInfo, setShowInfo, videoId, dbState } = useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();

  useEffect(() => {
    console.log("musicInfo rendered");
    setInfoAvailable(false);
    if (dbState === undefined || musicId === "") {
      return;
    }
    db.current = dbState;
    const infoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .index("videoId")
      .get(musicId);
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
    };
  }, [dbState, musicId]);

  return (
    <div
      className={showInfo ? styles.notHidden : styles.hidden}
      id={styles.musicInfo}
    >
      <span
        className="material-icons-round"
        id={styles.closeButton}
        onClick={() => setShowInfo(false)}
      >
        close
      </span>
      <div>
        {musicId === "" ? null : (
          <img
            alt={musicId}
            src={`https://i.ytimg.com/vi/${musicId}/mqdefault.jpg`}
          />
        )}
      </div>
      {videoId === musicId ? (
        <div>This is playing</div>
      ) : (
        <div>Not playing</div>
      )}
      {infoAvailable ? (
        <div>
          <div>id : {musicId}</div>
          <div>
            {info.title} - {info.artist.join(", ")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
