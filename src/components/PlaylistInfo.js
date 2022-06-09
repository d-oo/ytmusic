import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home.js";

import styles from "./PlaylistInfo.module.css";

export default function PlaylistInfo({ playlistId }) {
  const { showPlaylist, setShowPlaylist, isUpdated, setIsUpdated, dbState } =
    useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();

  useEffect(() => {
    setInfoAvailable(false);
    if (dbState === undefined || playlistId === "") {
      return;
    }
    db.current = dbState;
    const infoReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .get(playlistId);
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
      setIsUpdated(false);
    };
  }, [dbState, playlistId, isUpdated, setIsUpdated]);

  return (
    <div
      className={showPlaylist ? styles.notHidden : styles.hidden}
      id={styles.playlistInfo}
    >
      <span
        className="material-icons-round"
        id={styles.closeButton}
        onClick={() => setShowPlaylist(false)}
      >
        close
      </span>
      {infoAvailable ? (
        <div>
          <div>{info.title}</div>
        </div>
      ) : null}
    </div>
  );
}
