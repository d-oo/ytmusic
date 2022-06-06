import { useContext } from "react";
import YouTube from "react-youtube";
import { AppContext } from "../Home";
import styles from "./YT.module.css";

export default function YT() {
  const { videoId, setPlayer, videoOn, setIsPlaying, showYT } =
    useContext(AppContext);
  const opts = {
    width: "320", //320 384 256
    height: "180", //180 216 144
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
      console.log("end");
    }
  }

  return (
    <div className={showYT ? styles.notHidden : styles.hidden} id={styles.yt}>
      {videoOn ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      ) : null}
    </div>
  );
}
