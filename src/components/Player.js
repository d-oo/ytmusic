import { useContext } from "react";
import { AppContext } from "../Home";
import styles from "./Player.module.css";
import { Link } from "react-router-dom";

function Player() {
  const {
    setVideoId,
    player,
    //setPlayer,
    showInfo,
    setShowInfo,
    videoOn,
    setVideoOn,
    title,
    isPlaying,
  } = useContext(AppContext);

  function create(event) {
    setVideoId("jlwCOYs7OvE");
    setVideoOn(true);
  }

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
      ) : (
        <button onClick={create}>Create</button>
      )}
      <div id={styles.title} onClick={() => setShowInfo(!showInfo)}>
        {title}
      </div>
      <div className={styles.Links}>
        <Link to="/yt">
          LinkToYT<br></br>
        </Link>
        <Link to="/">LinkToHome</Link>
      </div>
      <div>{videoOn ? null : <div>no youtube</div>}</div>
    </div>
  );
}

export default Player;
