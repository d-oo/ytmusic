import { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import PlayingMotion from "./PlayingMotion";

import styles from "./Playlists.module.css";

export default function Playlists() {
  const {
    playPlaylist,
    playShuffle,
    playingPlaylistId,
    isPlaying,
    loopPlaylist,
    setLoopPlaylist,
    shuffle,
    setShuffle,
    dbState,
    playlistResult,
    setPlaylistResult,
    isUpdated,
    setIsUpdated,
  } = useContext(AppContext);
  const [newTitle, setNewTitle] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const db = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (dbState === undefined || !isUpdated) {
      return;
    }
    db.current = dbState;
    const getAllReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .getAll();
    getAllReq.onsuccess = () => {
      const reversedArr = [...getAllReq.result].reverse();
      setPlaylistResult(reversedArr);
      setIsUpdated(false);
    };
  }, [dbState, isUpdated, setPlaylistResult, setIsUpdated]);

  const addData = () => {
    const newTitleStr = newTitle.trim();
    const addReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .add({
        title: newTitleStr,
        musicId: [],
        totalDuration: 0,
        videoCount: 0,
      });
    addReq.onsuccess = () => {
      console.log("succefully added playlist!");
      setIsUpdated(true);
      //이 부분에 추가 완료 알림창 띄움
    };
    addReq.onerror = () => {
      if (addReq.error.name === "ConstraintError") {
        console.log("already existing playlist title");
        //이 부분에 해당 제목의 재생목록이 이미 존재한다는 알림창 띄움
      } else {
        console.log(addReq.error);
      }
    };
  };

  return (
    <div id={styles.playlists}>
      {showAddNew ? (
        <div id={styles.inputDiv}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (newTitle.trim() === "") {
                return;
              }
              setShowAddNew(false);
              addData();
              setNewTitle("");
            }}
          >
            <input
              id={styles.newTitleInput}
              value={newTitle}
              type="text"
              placeholder="new playlist"
              onChange={(event) => {
                setNewTitle(event.target.value);
              }}
              spellCheck="false"
              autoComplete="off"
            />
          </form>
          <div id={styles.doneButtonDiv}>
            <span
              className="material-icons-round"
              id={
                newTitle.trim() === "" ? styles.doneDisabled : styles.doneButton
              }
              onClick={
                newTitle.trim() === ""
                  ? null
                  : () => {
                      setShowAddNew(false);
                      addData();
                      setNewTitle("");
                    }
              }
            >
              done
            </span>
          </div>
          <div id={styles.cancelButtonDiv}>
            <span
              className="material-icons-round"
              id={styles.cancelButton}
              onClick={() => {
                setShowAddNew(false);
                setNewTitle("");
              }}
            >
              close
            </span>
          </div>
        </div>
      ) : (
        <div id={styles.addDiv} onClick={() => setShowAddNew(true)}>
          <span className="material-icons-round">add</span>새 재생목록 추가
        </div>
      )}
      <div id={styles.playlistResult}>
        {playlistResult.map((item, index) => (
          <div
            className={styles.playlist}
            id={
              location.pathname === `/playlist/${item.id}`
                ? styles.playing
                : null
            }
            key={index}
          >
            <div
              id={styles.listTitleDiv}
              onClick={() => {
                navigate(`/playlist/${item.id}`, {
                  replace: location.pathname === `/playlist/${item.id}`,
                });
              }}
            >
              {playingPlaylistId === String(item.id) ? (
                <div id={styles.playingMotion}>
                  <PlayingMotion isPaused={!isPlaying} />
                </div>
              ) : null}
              <div
                id={styles.listTitle}
                className={
                  playingPlaylistId === String(item.id)
                    ? styles.titleShort
                    : styles.titleLong
                }
              >
                {item.title}
              </div>
            </div>
            <div id={styles.countDiv}>
              <div>{item.videoCount}</div>곡
            </div>
            <div id={styles.playButtonDiv}>
              {playingPlaylistId === String(item.id) ? (
                <span
                  className="material-icons-round"
                  id={loopPlaylist ? styles.repeatActive : styles.repeatButton}
                  onClick={() => setLoopPlaylist((prev) => !prev)}
                >
                  repeat
                </span>
              ) : (
                <span
                  className="material-icons-round"
                  id={
                    item.videoCount === 0
                      ? styles.playDisabled
                      : styles.playButton
                  }
                  onClick={
                    item.videoCount === 0
                      ? null
                      : () =>
                          playPlaylist(String(item.musicId[0]), String(item.id))
                  }
                >
                  play_arrow
                </span>
              )}
            </div>
            <div id={styles.shuffleButtonDiv}>
              <span
                id={
                  item.videoCount === 0
                    ? styles.shuffleDisabled
                    : shuffle && playingPlaylistId === String(item.id)
                    ? styles.shuffleActive
                    : styles.shuffleButton
                }
                className="material-icons-round"
                onClick={
                  item.videoCount === 0
                    ? null
                    : playingPlaylistId === String(item.id)
                    ? () => setShuffle((prev) => !prev)
                    : () => playShuffle(String(item.id), item.musicId)
                }
              >
                shuffle
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
