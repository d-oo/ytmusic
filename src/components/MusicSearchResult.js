import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./MusicSearchResult.module.css";

export default function MusicSearchResult({
  info,
  index,
  selectedItem,
  setSelectedItem,
  setTotalDuration,
}) {
  const {
    setPlayingMusicId,
    setPlayingVideoId,
    setVideoOn,
    setTitle,
    dbState,
  } = useContext(AppContext);
  const [checked, setChecked] = useState(false);
  const db = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    db.current = dbState;
  }, [dbState]);

  useEffect(() => {
    setChecked(selectedItem.includes(info.id));
  }, [selectedItem, info.id]);

  return (
    <div
      id={styles.flexContainer}
      className={checked ? styles.checked : styles.notChecked}
    >
      <img
        alt={"musicSearchResult" + index}
        src={`https://i.ytimg.com/vi/${info.videoId}/mqdefault.jpg`}
        width="112"
        height="63"
        onClick={() => {
          if (selectedItem.includes(info.id)) {
            setSelectedItem((prev) => prev.filter((item) => item !== info.id));
            setTotalDuration((prev) => prev - info.duration);
          } else {
            setSelectedItem((prev) => [...prev, info.id]);
            setTotalDuration((prev) => prev + info.duration);
          }
        }}
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
    </div>
  );
}
