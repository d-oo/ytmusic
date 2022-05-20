import { useState } from "react";
import YouTube from "react-youtube";

function YT({ ytid }) {
  const [isOn, setIsOn] = useState(false);
  function fnccr(event) {
    setIsOn(true);
    console.log(ytid);
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
    console.log("loaded");
  }
  function onPlayerStateChange(event) {
    if (event.data === 0) {
      console.log("end");
    }
  }

  return (
    <div onContextMenu={(event) => event.preventDefault()}>
      <button onClick={fnccr}>Create</button>
      <button>ChangeProps</button>
      <div id="playerLayer">
        {isOn ? (
          <YouTube
            videoId="jlwCOYs7OvE"
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

export default YT;
