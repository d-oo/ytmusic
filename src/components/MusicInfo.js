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
    isPlaying,
    showYT,
    setShowYT,
    playingMusicId,
    setPlayingMusicId,
    setPlayingVideoId,
    setVideoOn,
    setTitle,
    isUpdated,
    setIsUpdated,
    playlistResult,
    dbState,
  } = useContext(AppContext);
  const [info, setInfo] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showAddMusic, setShowAddMusic] = useState(() => {});
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
    db.current = dbState;
    const infoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .get(Number(musicId));
    infoReq.onsuccess = () => {
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
  }, [dbState, musicId, isUpdated]);

  useEffect(() => {
    return () => setIsUpdated(true);
  }, [setIsUpdated]);

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
      console.log("succefully updated!");
      //업데이트 완료 창
      setShowResult(false);
      setIsUpdated(true);
    };
  };

  return (
    <div id={styles.musicInfo}>
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
            <img
              alt={`musicInfo${musicId}`}
              src={`https://i.ytimg.com/vi/${info.videoId}/mqdefault.jpg`}
              width="384"
              height="216"
            />
          )}
          <div id={styles.gridContainer}>
            <div id={styles.title}>{info.title}</div>
            <div id={styles.artist}>{info.artist.join(", ")}</div>
            <div id={styles.buttons}>
              {showYT ? (
                <PlayingMotion isPaused={!isPlaying} />
              ) : (
                <span
                  className="material-icons-round"
                  onClick={() => {
                    setPlayingMusicId(musicId);
                    setPlayingVideoId(info.videoId);
                    setVideoOn(true);
                    setTitle(info.title);
                  }}
                >
                  play_arrow
                </span>
              )}
              <div id={styles.addToDiv}>
                <span
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
                              key={index}
                              className={styles.result}
                              style={{ background: "gray", cursor: "default" }}
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
                onClick={() => showAddMusic(true)}
              >
                edit
              </span>
              <span
                className="material-icons-round"
                onClick={() => {
                  console.log("delete");
                }}
              >
                delete
              </span>
            </div>
          </div>
          <div id={styles.category}>
            {info.category === "Song" ? "가요" : "기악"}
          </div>
          <p className={styles.detail}>비디오 ID : {info.videoId}</p>
          <p className={styles.detail}>
            음악 길이 : {duration.m}분 {duration.s}초
          </p>
          <p id={styles.tagContainer} className={styles.detail}>
            태그 :
            {info.tag.map((item, index) => (
              <span
                key={"infotag" + index}
                className={styles.tag}
                onClick={
                  item === ""
                    ? null
                    : () => {
                        console.log(item);
                      }
                }
              >
                {"#" + item}
              </span>
            ))}
          </p>
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
