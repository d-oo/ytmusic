import { useContext } from "react";
import YouTube from "react-youtube";
import { AppContext } from "../Home";
import styles from "./YT.module.css";

export default function YT() {
  const {
    playingMusicId,
    setPlayingMusicId,
    playNext,
    loopMusic,
    playingMusicInfo,
    player,
    setPlayer,
    videoOn,
    setIsPlaying,
    volume,
    isMute,
    showYT,
  } = useContext(AppContext);
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
    event.target.setVolume(volume);
    if (isMute) {
      event.target.mute();
    }
  }
  function onPlayerStateChange(event) {
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    } else if (event.data === 0) {
      setIsPlaying(false);
      if (loopMusic) {
        const tmp = playingMusicId;
        setPlayingMusicId("");
        setTimeout(() => setPlayingMusicId(tmp));
        setTimeout(() => player.playVideo());
      } else {
        playNext();
      }
    }
  }

  return (
    <div className={showYT ? null : styles.hidden} id={styles.yt}>
      {videoOn ? (
        <YouTube
          videoId={playingMusicInfo.videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      ) : null}
    </div>
  );
}
