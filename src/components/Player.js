import { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./Player.module.css";

export default function Player() {
  const { videoId, player, setShowInfo, videoOn, title, isPlaying, setInfoId } =
    useContext(AppContext);

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
      <div
        id={styles.title}
        onClick={() => {
          setInfoId(videoId);
          setShowInfo(true);
        }}
      >
        {videoOn ? <div>{title}</div> : null}
      </div>
      <div className={styles.Links}>
        <Link to="/">
          LinkToHome
          <br />
        </Link>
        <Link to="/other">
          LinkToOther
          <br />
        </Link>
      </div>
    </div>
  );
}
