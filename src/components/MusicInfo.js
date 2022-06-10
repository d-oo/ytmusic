import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import AddMusic from "./AddMusic";
import Modal from "./Modal";

import styles from "./MusicInfo.module.css";

export default function MusicInfo() {
  const {
    showMusicInfo,
    setShowMusicInfo,
    infoId,
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
  const [showAddMusic, setShowAddMusic] = useState(() => {});
  const db = useRef();

  useEffect(() => {
    console.log("musicInfoA");
    setInfoAvailable(false);
    if (dbState === undefined || infoId === "") {
      return;
    }
    console.log("musicInfoB");
    db.current = dbState;
    const infoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .index("videoId")
      .get(infoId);
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
      setIsUpdated(false);
    };
  }, [dbState, infoId, isUpdated, setIsUpdated]);

  return (
    <Modal setHandleFunction={setShowMusicInfo}>
      <div id={styles.musicInfo}>
        <span
          className="material-icons-round"
          id={styles.closeButton}
          onClick={() => showMusicInfo(false)}
        >
          close
        </span>
        <div>
          {infoId === "" ? null : (
            <img
              alt={infoId}
              src={`https://i.ytimg.com/vi/${infoId}/mqdefault.jpg`}
            />
          )}
        </div>
        {videoId === infoId ? (
          <div>This is playing</div>
        ) : (
          <div>Not playing</div>
        )}
        {infoAvailable ? (
          <div>
            <div>id : {infoId}</div>
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
            <button onClick={() => showAddMusic(true)}>Edit Music</button>
            <AddMusic
              from="MusicInfo"
              showAddMusic={showAddMusic}
              setShowAddMusic={setShowAddMusic}
              musicInfo={info}
            />
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
