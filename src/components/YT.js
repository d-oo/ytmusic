import { useContext } from "react";
import YouTube from "react-youtube";
import { AppContext } from "../Home";

function Player() {
  const { videoId, setPlayer, videoOn, setTitle, setIsPlaying } =
    useContext(AppContext);
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
    setTitle(event.target.getVideoData().title);
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
    <div>
      {videoOn ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      ) : (
        <div>no youtube</div>
      )}
    </div>
  );
}

export default Player;
