import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import PlayingMotion from "./PlayingMotion";

import styles from "./PlaylistMusic.module.css";

export default function PlaylistMusic({
  info,
  index,
  playlistId,
  selectedItem,
  setSelectedItem,
  setTotalDuration,
}) {
  const { playPlaylist, playingMusicId, playingPlaylistId, isPlaying } =
    useContext(AppContext);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setChecked(selectedItem.includes(info.id));
  }, [selectedItem, info.id]);

  return (
    <div
      id={styles.flexContainer}
      className={checked ? styles.checked : styles.notChecked}
    >
      <img
        id={styles.thumbnail}
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
        {playingPlaylistId === playlistId &&
        playingMusicId === String(info.id) ? (
          <PlayingMotion isPaused={!isPlaying} />
        ) : (
          <span
            className="material-icons-round"
            onClick={() => {
              playPlaylist(String(info.id), playlistId);
            }}
          >
            play_arrow
          </span>
        )}
      </div>
    </div>
  );
}
