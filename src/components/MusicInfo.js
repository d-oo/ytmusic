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
import PlayingMotion from "./PlayingMotion";

import styles from "./MusicInfo.module.css";

export default function MusicInfo() {
  const {
    playSingle,
    showYT,
    setShowYT,
    playingMusicId,
    isUpdated,
    setIsUpdated,
    playlistResult,
    dbState,
    alertFor,
  } = useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showAddMusic, setShowAddMusic] = useState(() => {});
  const [modalState, setModalState] = useState(false);
  const [duration, setDuration] = useState({ h: 0, m: 0, s: 0 });
  const [inPlaylist, setInPlaylist] = useState([]);
  const db = useRef();
  const resultRef = useRef();
  const { musicId } = useParams();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setInfoAvailable(false);
    if (dbState === undefined || musicId === "") {
      return;
    }
    if (isNaN(musicId)) {
      navigate("/wrongmusic", { replace: true });
      return;
    }
    db.current = dbState;
    const infoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .get(Number(musicId));
    infoReq.onsuccess = () => {
      if (infoReq.result === undefined) {
        navigate("/wrongmusic", { replace: true });
        return;
      }
      setDuration({
        m: Math.floor(infoReq.result.duration / 60),
        s: infoReq.result.duration % 60,
      });
      setInfo(infoReq.result);
      setInfoAvailable(true);
      const IsMusicInPlaylistReq = db.current
        .transaction("playlist", "readonly")
        .objectStore("playlist")
        .index("musicId")
        .getAll(Number(musicId));
      IsMusicInPlaylistReq.onsuccess = () => {
        setInPlaylist(IsMusicInPlaylistReq.result.map((item) => item.id));
      };
    };
  }, [dbState, musicId, isUpdated, navigate]);

  useEffect(() => {
    if (musicId === playingMusicId) {
      setShowYT(true);
    } else {
      setShowYT(false);
    }
    return () => setShowYT(false);
  }, [musicId, playingMusicId, setShowYT]);

  useEffect(() => {
    if (!showResult) {
      return;
    }
    const onClickOutside = (event) => {
      if (showResult && !resultRef.current.contains(event.target)) {
        setShowResult(false);
      }
    };
    setTimeout(() => window.addEventListener("click", onClickOutside), 0);
    return () => {
      window.removeEventListener("click", onClickOutside);
    };
  }, [showResult]);

  const addToPlaylist = (playlistInfo) => {
    let plusDuration = info.duration;
    if (playlistInfo.musicId.includes(info.id)) {
      plusDuration = 0;
    }
    const newArr = [...new Set([...playlistInfo.musicId, info.id])];
    const updateReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistInfo.title,
        musicId: newArr,
        totalDuration: playlistInfo.totalDuration + plusDuration,
        videoCount: newArr.length,
        id: playlistInfo.id,
      });
    updateReq.onsuccess = () => {
      alertFor("addToPlaylistSingle");
      setIsUpdated(true);
    };
  };

  const deleteMusic = () => {
    if (playingMusicId === musicId) {
      alertFor("deleteMusicF");
      return;
    }
    const deleteReq = db.current
      .transaction("music", "readwrite")
      .objectStore("music")
      .delete(Number(musicId));
    deleteReq.onsuccess = () => {
      alertFor("deleteMusic");
      navigate(-1);
    };
    inPlaylist.forEach((item, index) => {
      const transaction = db.current
        .transaction("playlist", "readwrite")
        .objectStore("playlist");
      const getReq = transaction.get(item);
      getReq.onsuccess = () => {
        const getResult = getReq.result;
        const updateReq = transaction.put({
          title: getResult.title,
          musicId: getResult.musicId.filter((i) => i !== Number(musicId)),
          totalDuration: getResult.totalDuration - info.duration,
          videoCount: getResult.videoCount - 1,
          id: getResult.id,
        });
        updateReq.onsuccess = () => {
          if (index === inPlaylist.length - 1) {
            setIsUpdated(true);
          }
        };
      };
    });
  };

  return (
    <div
      id={styles.musicInfo}
      className={modalState ? styles.highZ : styles.lowZ}
    >
      <div id={styles.pageTitle}>
        <span
          className="material-icons-round"
          id={styles.backButton}
          onClick={() => navigate(-1)}
        >
          arrow_back
        </span>
        음악 정보
      </div>
      {infoAvailable ? (
        <div id={styles.info}>
          {musicId === "" ? null : (
            <a
              href={`https://www.youtube.com/watch?v=${info.videoId}`}
              target="_blank"
              rel="noreferrer"
            >
              <img
                id={showYT ? styles.imgHidden : styles.thumbnail}
                alt={`musicInfo${musicId}`}
                src={`https://i.ytimg.com/vi/${info.videoId}/mqdefault.jpg`}
                width="384"
                height="216"
              />
            </a>
          )}
          <div id={styles.gridContainer}>
            <div id={styles.title}>{info.title}</div>
            <div id={styles.artist}>{info.artist.join(", ")}</div>
            <div id={styles.buttons}>
              {showYT ? (
                <PlayingMotion />
              ) : (
                <span
                  className="material-icons-round"
                  onClick={() => {
                    playSingle(musicId);
                  }}
                >
                  play_arrow
                </span>
              )}
              <div id={styles.addToDiv}>
                <span
                  id={
                    showResult
                      ? styles.addToButtonBlue
                      : styles.addToButtonBlack
                  }
                  className="material-icons-round"
                  onClick={() => {
                    if (showResult) {
                      return;
                    }
                    setShowResult(true);
                  }}
                >
                  playlist_add
                </span>
                <div id={styles.wrapper} ref={resultRef}>
                  {showResult ? (
                    <div id={styles.results}>
                      {playlistResult.map((item, index) => {
                        if (inPlaylist.includes(item.id)) {
                          return (
                            <div
                              key={index + "MinfoPresult"}
                              className={styles.result}
                              style={{
                                background: "lightgray",
                                cursor: "default",
                              }}
                            >
                              {item.title}
                            </div>
                          );
                        } else {
                          return (
                            <div
                              key={index}
                              className={styles.result}
                              onClick={() => addToPlaylist(item)}
                            >
                              {item.title}
                            </div>
                          );
                        }
                      })}
                    </div>
                  ) : null}
                </div>
              </div>
              <span
                className="material-icons-round"
                onClick={() => {
                  if (musicId === playingMusicId) {
                    alertFor("updateMusicF");
                    return;
                  }
                  showAddMusic(true);
                }}
              >
                edit
              </span>
              <span className="material-icons-round" onClick={deleteMusic}>
                delete
              </span>
            </div>
          </div>
          <div
            id={info.category === "Song" ? styles.song : styles.inst}
            className={styles.category}
          >
            {info.category === "Song" ? "가요" : "기악"}
          </div>
          <p className={styles.detail}>비디오 ID : {info.videoId}</p>
          <p className={styles.detail}>
            음악 길이 : {duration.m}분 {duration.s}초
          </p>
          <p className={styles.detail}>재생 횟수 : {info.playCount}회</p>
          <p id={styles.tagContainer} className={styles.detail}>
            태그 :
            {info.tag.map((item, index) => (
              <span key={"infotag" + index} className={styles.tag}>
                {"#" + item}
              </span>
            ))}
          </p>
          <AddMusic
            from="MusicInfo"
            showAddMusic={showAddMusic}
            setShowAddMusic={setShowAddMusic}
            setModalState={setModalState}
            musicInfo={info}
          />
        </div>
      ) : null}
    </div>
  );
}
