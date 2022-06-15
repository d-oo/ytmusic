import {
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
  useContext,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../Home";
import AddMusic from "./AddMusic";

import styles from "./MusicInfo.module.css";

export default function MusicInfo() {
  const {
    setShowYT,
    playingMusicId,
    setPlayingMusicId,
    setPlayingVideoId,
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
  const { musicId } = useParams();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setInfoAvailable(false);
    if (dbState === undefined || musicId === "") {
      return;
    }
    db.current = dbState;
    const infoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .get(Number(musicId));
    infoReq.onsuccess = () => {
      setInfo(infoReq.result);
      setInfoAvailable(true);
      setIsUpdated(false);
    };
  }, [dbState, musicId, isUpdated, setIsUpdated]);

  useEffect(() => {
    if (musicId === playingMusicId) {
      setShowYT(true);
    } else {
      setShowYT(false);
    }
    return () => setShowYT(false);
  }, [musicId, playingMusicId, setShowYT]);

  return (
    <div id={styles.musicInfo}>
      <span
        className="material-icons-round"
        id={styles.backButton}
        onClick={() => navigate(-1)}
      >
        arrow_back
      </span>

      {infoAvailable ? (
        <div>
          <div>
            {musicId === "" ? null : (
              <img
                alt={`musicInfo${musicId}`}
                src={`https://i.ytimg.com/vi/${info.videoId}/mqdefault.jpg`}
              />
            )}
          </div>
          <div>id : {musicId}</div>
          <div>
            {info.title} - {info.artist.join(", ")}
          </div>
          <button
            onClick={() => {
              setPlayingMusicId(musicId);
              setPlayingVideoId(info.videoId);
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
  );
}
