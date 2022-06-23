import { useContext } from "react";
import YouTube from "react-youtube";
import { AppContext } from "../Home";
import styles from "./YT.module.css";

export default function YT() {
  const { playingVideoId, setPlayer, videoOn, setIsPlaying, showYT } =
    useContext(AppContext);
  const opts = {
    width: "384",
    height: "216",
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      disablekb: 1,
    },
  };
  function onPlayerReady(event) {
    setPlayer(event.target);
  }
  function onPlayerStateChange(event) {
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setIsPlaying(false);
      console.log("end");
    }
  }

  return (
    <div className={showYT ? null : styles.hidden} id={styles.yt}>
      {videoOn ? (
        <YouTube
          videoId={playingVideoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      ) : null}
    </div>
  );
}
