import { useContext } from "react";
import { AppContext } from "../Home";
import YT from "./YT";

import styles from "./MusicInfo.module.css";

function MusicInfo({ musicId }) {
  const { videoOn, showInfo } = useContext(AppContext);

  return (
    <div
      className={showInfo ? styles.notHidden : styles.hidden}
      id={styles.musicInfo}
    >
      {videoOn ? <YT /> : <div>thumbnail</div>}
      MusicInfoContent : {musicId}
    </div>
  );
}

export default MusicInfo;
