import { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import PlayingMotion from "./PlayingMotion";

import styles from "./Playlists.module.css";

export default function Playlists() {
  const {
    playPlaylist,
    playingPlaylistId,
    isPlaying,
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
      {showAddNew ? null : (
        <span
          className="material-icons-round"
          id={styles.addButton}
          onClick={() => setShowAddNew(true)}
        >
          add
        </span>
      )}
      {showAddNew ? (
        <div>
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
          <span
            className="material-icons-round"
            id={styles.cancelButton}
            onClick={() => {
              setShowAddNew(false);
              setNewTitle("");
            }}
          >
            cancel
          </span>
        </div>
      ) : null}
      <div>
        {playlistResult.map((item, index) => (
          <div className={styles.playlist} key={index}>
            <div id={styles.listTitleDiv}>
              <span
                id={styles.listTitle}
                onClick={() => {
                  navigate(`/playlist/${item.id}`, {
                    replace: location.pathname === `/playlist/${item.id}`,
                  });
                }}
              >
                {item.title}
              </span>
            </div>
            <div>{item.videoCount}</div>
            <div id={styles.playButtonDiv}>
              {playingPlaylistId === String(item.id) ? (
                <PlayingMotion isPaused={!isPlaying} />
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
          </div>
        ))}
      </div>
    </div>
  );
}
