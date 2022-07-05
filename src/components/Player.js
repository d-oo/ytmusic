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
    shuffle,
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
          <div id={styles.buttons}>
            <span
              className="material-icons-round"
              id={loopMusic ? styles.loopActive : styles.loopButton}
              onClick={() => setLoopMusic((prev) => !prev)}
            >
              loop
            </span>
            <span
              className="material-icons-round"
              id={
                !loopPlaylist &&
                !shuffle &&
                playingPlaylist.findIndex(
                  (i) => i.id === Number(playingMusicId)
                ) < 1
                  ? styles.prevDisabled
                  : styles.prevButton
              }
              onClick={
                !loopPlaylist &&
                !shuffle &&
                playingPlaylist.findIndex(
                  (i) => i.id === Number(playingMusicId)
                ) < 1
                  ? null
                  : () => playPrevious()
              }
            >
              skip_previous
            </span>
            <span className="material-icons-round" onClick={playOrPause}>
              {isPlaying ? "pause" : "play_arrow"}
            </span>
            <span
              className="material-icons-round"
              id={
                !loopPlaylist &&
                !shuffle &&
                playingPlaylist.findIndex(
                  (i) => i.id === Number(playingMusicId)
                ) +
                  1 ===
                  playingPlaylist.length
                  ? styles.nextDisabled
                  : styles.nextButton
              }
              onClick={
                !loopPlaylist &&
                !shuffle &&
                playingPlaylist.findIndex(
                  (i) => i.id === Number(playingMusicId)
                ) +
                  1 ===
                  playingPlaylist.length
                  ? null
                  : () => playNext()
              }
            >
              skip_next
            </span>
            <span className="material-icons-round">queue_music</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
