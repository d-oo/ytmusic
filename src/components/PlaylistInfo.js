import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import Modal from "./Modal";

import styles from "./PlaylistInfo.module.css";

export default function PlaylistInfo() {
  const {
    showPlaylist,
    setShowPlaylist,
    playlistInfoId,
    isUpdated,
    setIsUpdated,
    dbState,
  } = useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();

  useEffect(() => {
    setInfoAvailable(false);
    if (dbState === undefined || playlistInfoId === "") {
      return;
    }
    db.current = dbState;
    const infoReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .get(playlistInfoId);
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
      setIsUpdated(false);
    };
  }, [dbState, playlistInfoId, isUpdated, setIsUpdated]);

  return (
    <Modal setHandleFunction={setShowPlaylist}>
      <div id={styles.playlistInfo}>
        <span
          className="material-icons-round"
          id={styles.closeButton}
          onClick={() => showPlaylist(false)}
        >
          close
        </span>
        {infoAvailable ? (
          <div>
            <div>{info.title}</div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
