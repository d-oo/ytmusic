import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./Player.module.css";

export default function Player() {
  const {
    playNext,
    playPrevious,
    playingMusicId,
    playingMusicInfo,
    playingPlaylist,
    playingPlaylistId,
    loopMusic,
    setLoopMusic,
    loopPlaylist,
    shuffle,
    player,
    videoOn,
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
      <div id={styles.thumbnail}>
        {videoOn ? (
          <img
            id={styles.img}
            alt={playingMusicInfo.videoId}
            src={`https://i.ytimg.com/vi/${playingMusicInfo.videoId}/mqdefault.jpg`}
            width="192"
            height="108"
          />
        ) : (
          <div id={styles.emptyThumbnail} />
        )}
      </div>
      <div id={styles.titleWrapper}>
        <div
          id={styles.title}
          onClick={
            videoOn
              ? () =>
                  navigate(`/music/${playingMusicId}`, {
                    replace: location.pathname === `/music/${playingMusicId}`,
                  })
              : null
          }
        >
          {videoOn ? playingMusicInfo.title : "title"}
        </div>
      </div>
      <div id={styles.artist}>
        {videoOn ? playingMusicInfo.artist.join(", ") : "artist"}
      </div>
      <div id={styles.buttons}>
        <span
          className="material-icons-round"
          id={
            videoOn
              ? loopMusic
                ? styles.loopActive
                : styles.loopButton
              : styles.loopDisabled
          }
          onClick={videoOn ? () => setLoopMusic((prev) => !prev) : null}
        >
          loop
        </span>
        <span
          className="material-icons-round"
          id={
            !loopPlaylist &&
            !shuffle &&
            playingPlaylist.findIndex((i) => i.id === Number(playingMusicId)) <
              1
              ? styles.prevDisabled
              : styles.prevButton
          }
          onClick={
            !loopPlaylist &&
            !shuffle &&
            playingPlaylist.findIndex((i) => i.id === Number(playingMusicId)) <
              1
              ? null
              : () => playPrevious()
          }
        >
          skip_previous
        </span>
        <span
          className="material-icons-round"
          id={videoOn ? styles.playPauseButton : styles.playDisabled}
          onClick={videoOn ? playOrPause : null}
        >
          {isPlaying ? "pause" : "play_arrow"}
        </span>
        <span
          className="material-icons-round"
          id={
            !loopPlaylist &&
            !shuffle &&
            playingPlaylist.findIndex((i) => i.id === Number(playingMusicId)) +
              1 ===
              playingPlaylist.length
              ? styles.nextDisabled
              : styles.nextButton
          }
          onClick={
            !loopPlaylist &&
            !shuffle &&
            playingPlaylist.findIndex((i) => i.id === Number(playingMusicId)) +
              1 ===
              playingPlaylist.length
              ? null
              : () => playNext()
          }
        >
          skip_next
        </span>
        <span
          className="material-icons-round"
          id={
            playingPlaylistId === ""
              ? styles.playlistDisabled
              : styles.playlistButton
          }
        >
          queue_music
        </span>
      </div>
      <button onClick={() => console.log(player.getVolume())}>
        volume get
      </button>
      <button onClick={() => player.setVolume(50)}>setVolume</button>
    </div>
  );
}
