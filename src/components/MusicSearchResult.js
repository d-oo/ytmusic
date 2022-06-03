import { useContext } from "react";
import { AppContext } from "../Home";
import styles from "./MusicSearchResult.module.css";

export default function MusicSearchResult({ info, index }) {
  const { setShowInfo, setInfoId } = useContext(AppContext);

  return (
    <div className={styles.tmp}>
      <button
        onClick={() => {
          setInfoId(info.videoId);
          setShowInfo(true);
        }}
      >
        Info
      </button>
      {info.title} by {info.artist.join(", ")}
    </div>
  );
}
