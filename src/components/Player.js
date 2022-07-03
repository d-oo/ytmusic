import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./Player.module.css";

export default function Player() {
  const {
    playNext,
    playPrevious,
    playingMusicId,
    playingPlaylist,
    loopMusic,
    setLoopMusic,
    loopPlaylist,
    player,
    videoOn,
    title,
    isPlaying,
  } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  function playOrPause() {
    if (isPlaying === true) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  return (
    <div id={styles.player}>
      {videoOn ? (
        <div>
          <button onClick={playOrPause}>{isPlaying ? "Pause" : "Play"}</button>
          <div
            id={styles.title}
            onClick={() =>
              navigate(`/music/${playingMusicId}`, {
                replace: location.pathname === `/music/${playingMusicId}`,
              })
            }
          >
            {title}
          </div>
          <button
            onClick={() => playPrevious()}
            disabled={
              !loopPlaylist &&
              playingPlaylist.findIndex(
                (i) => i.id === Number(playingMusicId)
              ) < 1
            }
          >
            previous
          </button>
          <button
            onClick={() => playNext()}
            disabled={
              !loopPlaylist &&
              playingPlaylist.findIndex(
                (i) => i.id === Number(playingMusicId)
              ) +
                1 ===
                playingPlaylist.length
            }
          >
            next
          </button>
          <button onClick={() => setLoopMusic((prev) => !prev)}>
            {loopMusic ? "it's music loop" : "it's not music loop"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
