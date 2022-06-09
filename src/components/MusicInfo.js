import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import AddMusic from "./AddMusic";

import styles from "./MusicInfo.module.css";

export default function MusicInfo({ musicId }) {
  const {
    showInfo,
    setShowInfo,
    videoId,
    setVideoId,
    setVideoOn,
    setTitle,
    isUpdated,
    setIsUpdated,
    dbState,
  } = useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const [isAddMusicOn, setIsAddMusicOn] = useState(false);
  const db = useRef();

  useEffect(() => {
    console.log("musicInfoA");
    setInfoAvailable(false);
    if (dbState === undefined || musicId === "") {
      return;
    }
    console.log("musicInfoB");
    db.current = dbState;
    const infoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .index("videoId")
      .get(musicId);
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
      setIsUpdated(false);
    };
  }, [dbState, musicId, isUpdated, setIsUpdated]);

  return (
    <div
      className={showInfo ? styles.notHidden : styles.hidden}
      id={styles.musicInfo}
    >
      <span
        className="material-icons-round"
        id={styles.closeButton}
        onClick={() => setShowInfo(false)}
      >
        close
      </span>
      <div>
        {musicId === "" ? null : (
          <img
            alt={musicId}
            src={`https://i.ytimg.com/vi/${musicId}/mqdefault.jpg`}
          />
        )}
      </div>
      {videoId === musicId ? (
        <div>This is playing</div>
      ) : (
        <div>Not playing</div>
      )}
      {infoAvailable ? (
        <div>
          <div>id : {musicId}</div>
          <div>
            {info.title} - {info.artist.join(", ")}
          </div>
          <button
            onClick={() => {
              setVideoId(info.videoId);
              setVideoOn(true);
              setTitle(info.title);
            }}
          >
            Play
          </button>
          <button onClick={() => setIsAddMusicOn(true)}>Edit Music</button>
          <AddMusic
            from="MusicInfo"
            isAddMusicOn={isAddMusicOn}
            setIsAddMusicOn={setIsAddMusicOn}
            musicInfo={info}
          />
        </div>
      ) : null}
    </div>
  );
}
