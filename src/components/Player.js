import { useEffect, useState } from "react";
import YouTube from "react-youtube";

function Player({ ytid }) {
  const [player, setPlayer] = useState({});
  const [isOn, setIsOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [info, setInfo] = useState({});
  const [loading, setLoading] = useState("");
  const str = "태연 rain";
  const searchRequest = async (event) => {
    setLoading("Loading...");
    const json = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&type=video&q=${str}&key=AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY`
      )
    ).json();
    console.log(str.split(" ").join("+"));
    console.log(event);
    setLoading(json.items[0].snippet.title);
  };
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
      <div>{loading}</div>
      <button onClick={create}>Create</button>
      {isOn ? (
        <button onClick={playOrPause}>{isPlaying ? "Pause" : "Play"}</button>
      ) : (
        <span></span>
      )}
      <button onClick={searchRequest}>ChangeProps</button>
      <div>
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
