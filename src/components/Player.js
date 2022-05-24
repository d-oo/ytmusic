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

  function create() {
    setVideoId("jlwCOYs7OvE");
    setVideoOn(true);
  }

  function playOrPause() {
    if (isPlaying === true) {
      console.log(player);
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
      <button onClick={() => setShowInfo(!showInfo)}>showInfoTmp</button>
      <div id={styles.title} onClick={() => setShowInfo(!showInfo)}>
        {videoOn ? title : <div>no youtube</div>}
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

        <Link to="/addmusic">
          LinkToAddMusic
          <br />
        </Link>
      </div>
    </div>
  );
}

export default Player;
