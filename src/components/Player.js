import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./Player.module.css";

export default function Player() {
  const { playingMusicId, player, videoOn, title, isPlaying } =
    useContext(AppContext);
  const navigate = useNavigate();

  function playOrPause() {
    if (isPlaying === true) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  return (
    <div>
      {videoOn ? (
        <button onClick={playOrPause}>{isPlaying ? "Pause" : "Play"}</button>
      ) : null}
      {videoOn ? (
        <div
          id={styles.title}
          onClick={() => navigate(`/music/${playingMusicId}`)}
        >
          {title}
        </div>
      ) : null}
    </div>
  );
}
