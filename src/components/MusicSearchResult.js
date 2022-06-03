import { useContext } from "react";
import { AppContext } from "../Home";
import styles from "./MusicSearchResult.module.css";

export default function MusicSearchResult({ info, index }) {
  const { setShowInfo, setInfoId, setVideoId, setVideoOn, setTitle } =
    useContext(AppContext);

  return (
    <div className={styles.tmp}>
      <img
        alt={index}
        src={`https://i.ytimg.com/vi/${info.videoId}/default.jpg`}
      />
      {info.title} by {info.artist.join(", ")}
      <button
        onClick={() => {
          setInfoId(info.videoId);
          setShowInfo(true);
        }}
      >
        Info
      </button>
      <button
        onClick={() => {
          setVideoId(info.videoId);
          setVideoOn(true);
          setTitle(info.title);
        }}
      >
        Play
      </button>
    </div>
  );
}
