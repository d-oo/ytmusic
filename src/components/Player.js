import { useState } from "react";
import YouTube from "react-youtube";

function Player({ ytid }) {
  const [player, setPlayer] = useState({});
  const [isOn, setIsOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  function create(event) {
    setIsOn(true);
    event.target.remove();
  }
  const opts = {
    width: "256", //320 384 256
    height: "144", //180 216 144
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
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
    if (event.data === 0) {
      console.log("end");
    }
  }

  function playOrPause() {
    if (isPlaying === true) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  return (
    <div onContextMenu={(event) => event.preventDefault()}>
      <button onClick={create}>Create</button>
      {isOn ? (
        <button onClick={playOrPause}>{isPlaying ? "Pause" : "Play"}</button>
      ) : (
        <span></span>
      )}
      <button>ChangeProps</button>
      <div id="playerLayer">
        {isOn ? (
          <YouTube
            videoId={ytid}
            opts={opts}
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
          />
        ) : (
          <p>yeah</p>
        )}
      </div>
    </div>
  );
}

export default Player;
