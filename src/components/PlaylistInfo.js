import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../Home";

import styles from "./PlaylistInfo.module.css";

export default function PlaylistInfo() {
  const { isUpdated, setIsUpdated, dbState } = useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();
  const { playlistId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setInfoAvailable(false);
    if (dbState === undefined || playlistId === "") {
      return;
    }
    db.current = dbState;
    const infoReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .get(Number(playlistId));
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
      setIsUpdated(false);
    };
  }, [dbState, playlistId, isUpdated, setIsUpdated]);

  return (
    <div id={styles.playlistInfo}>
      <span className="material-icons-round" onClick={() => navigate(-1)}>
        arrow_back
      </span>
      {infoAvailable ? (
        <div>
          <div>{info.title}</div>
        </div>
      ) : null}
    </div>
  );
}
