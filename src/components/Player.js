import {
  useMemo,
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import Slider from "@mui/material/Slider";
import Tooltip from "@mui/material/Tooltip";
import styles from "./Player.module.css";

export default function Player() {
  const {
    handlePlaylistScroll,
    playNext,
    playPrev,
    secondToTime,
    playingMusicId,
    playingMusicInfo,
    playingPlaylist,
    playingPlaylistId,
    loopMusic,
    setLoopMusic,
    loopPlaylist,
    shuffle,
    shuffleList,
    player,
    videoOn,
    isPlaying,
    setIsPlaying,
    isMute,
    setIsMute,
    volume,
    setVolume,
  } = useContext(AppContext);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const interval = useRef();

  useEffect(() => {
    if (!videoOn) {
      return;
    }
    if (isPlaying) {
      clearInterval(interval.current);
      setTimer(player.getCurrentTime());
      interval.current = setInterval(
        () => setTimer(player.getCurrentTime()),
        1000
      );
    } else {
      clearInterval(interval.current);
    }
  }, [videoOn, isPlaying, player]);

  const playOrPause = useCallback(() => {
    if (isPlaying === true) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, [isPlaying, player]);

  const disablePrev = useMemo(() => {
    let arr;
    if (shuffle) {
      arr = shuffleList;
    } else {
      arr = playingPlaylist;
    }
    return (
      !loopPlaylist && arr.findIndex((i) => i.id === Number(playingMusicId)) < 1
    );
  }, [shuffle, shuffleList, playingPlaylist, loopPlaylist, playingMusicId]);

  const disableNext = useMemo(() => {
    let arr;
    if (shuffle) {
      arr = shuffleList;
    } else {
      arr = playingPlaylist;
    }
    return (
      !loopPlaylist &&
      arr.findIndex((i) => i.id === Number(playingMusicId)) + 1 === arr.length
    );
  }, [shuffle, shuffleList, playingPlaylist, loopPlaylist, playingMusicId]);

  const prevMusic = useMemo(() => {
    let arr;
    if (shuffle) {
      arr = shuffleList;
    } else {
      arr = playingPlaylist;
    }
    const currentIndex = arr.findIndex((i) => i.id === Number(playingMusicId));
    if (currentIndex > 0) {
      return (
        arr[currentIndex - 1].title +
        " - " +
        arr[currentIndex - 1].artist.join(", ")
      );
    } else if (loopPlaylist) {
      return (
        arr[arr.length - 1].title +
        " - " +
        arr[arr.length - 1].artist.join(", ")
      );
    } else {
      return "없음";
    }
  }, [shuffle, shuffleList, playingPlaylist, loopPlaylist, playingMusicId]);

  const nextMusic = useMemo(() => {
    let arr;
    if (shuffle) {
      arr = shuffleList;
    } else {
      arr = playingPlaylist;
    }
    const currentIndex = arr.findIndex((i) => i.id === Number(playingMusicId));
    if (currentIndex + 1 < arr.length) {
      return (
        arr[currentIndex + 1].title +
        " - " +
        arr[currentIndex + 1].artist.join(", ")
      );
    } else if (loopPlaylist) {
      return arr[0].title + " - " + arr[0].artist.join(", ");
    } else {
      return "없음";
    }
  }, [shuffle, shuffleList, playingPlaylist, loopPlaylist, playingMusicId]);

  const volumeQuality = useMemo(() => {
    if (isMute) {
      return "off";
    } else if (volume === 0) {
      return "mute";
    } else if (volume > 0 && volume <= 50) {
      return "down";
    } else {
      return "up";
    }
  }, [volume, isMute]);

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
        <Tooltip title={prevMusic} placement="left" arrow>
          <span
            className="material-icons-round"
            id={disablePrev ? styles.prevDisabled : styles.prevButton}
            onClick={disablePrev ? null : () => playPrev()}
          >
            skip_previous
          </span>
        </Tooltip>
        <span
          className="material-icons-round"
          id={videoOn ? styles.playPauseButton : styles.playDisabled}
          onClick={videoOn ? playOrPause : null}
        >
          {isPlaying ? "pause" : "play_arrow"}
        </span>
        <Tooltip title={nextMusic} placement="right" arrow>
          <span
            className="material-icons-round"
            id={disableNext ? styles.nextDisabled : styles.nextButton}
            onClick={disableNext ? null : () => playNext()}
          >
            skip_next
          </span>
        </Tooltip>
        <span
          className="material-icons-round"
          id={
            playingPlaylistId === ""
              ? styles.playlistDisabled
              : styles.playlistButton
          }
          onClick={playingPlaylistId === "" ? null : handlePlaylistScroll}
        >
          queue_music
        </span>
      </div>
      <Slider
        aria-label="progress"
        valueLabelDisplay="auto"
        defaultValue={0}
        value={timer}
        onChange={(event) => {
          setIsPlaying(false);
          setTimer(event.target.value);
        }}
        onChangeCommitted={(_, newValue) => {
          setTimer(newValue);
          player.seekTo(newValue);
        }}
        max={playingMusicInfo.duration}
        scale={secondToTime}
        sx={{
          color: "red",
          width: "240px",
          paddingTop: "6px",
          paddingBottom: "6px",
          "& .MuiSlider-thumb": {
            "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
              boxShadow: "inherit",
            },
          },
          "& .Mui-disabled": {
            color: "gray",
          },
          "& .MuiSlider-rail": {
            color: videoOn ? "currentColor" : "gray",
          },
        }}
        size="small"
        disabled={!videoOn}
      />
      <div id={styles.time}>
        <div id={styles.volumeWrapper}>
          <span
            id={styles.volumeButton}
            className="material-icons-round"
            onClick={() => {
              if (isMute) {
                setIsMute(false);
                window.localStorage.setItem("mute", false);
                if (player !== "") {
                  player.unMute();
                  player.setVolume(volume);
                }
              } else {
                setIsMute(true);
                window.localStorage.setItem("mute", true);
                if (player !== "") {
                  player.mute();
                }
              }
            }}
          >
            volume_{volumeQuality}
          </span>
          <div id={styles.volumeSlider}>
            <Slider
              aria-label="progress"
              valueLabelDisplay="auto"
              defaultValue={50}
              value={volume}
              onChange={(event) => {
                setVolume(event.target.value);
                setIsMute(false);
                window.localStorage.setItem("mute", false);
                if (player === "") {
                  return;
                }
                if (isMute) {
                  player.unMute();
                  player.setVolume(volume);
                }
                player.setVolume(event.target.value);
              }}
              onChangeCommitted={(_, newValue) => {
                window.localStorage.setItem("volume", newValue);
              }}
              max={100}
              sx={{
                color: "blue",
                width: "60px",
                paddingTop: "6px",
                paddingBottom: "6px",
                "& .MuiSlider-thumb": {
                  height: "9px",
                  width: "9px",
                  "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                    boxShadow: "inherit",
                  },
                },
              }}
              size="small"
            />
          </div>
        </div>
        {secondToTime(timer)} /{" "}
        {videoOn ? secondToTime(playingMusicInfo.duration) : "00:00"}
      </div>
    </div>
  );
}
