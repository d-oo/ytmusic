import { useState, useEffect, useRef, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../Home";
import styles from "./Playlists.module.css";

export default function Playlists() {
  const {
    dbState,
    playlistResult,
    setPlaylistResult,
    isUpdated,
    setIsUpdated,
  } = useContext(AppContext);
  const [newTitle, setNewTitle] = useState("");
  const [addNew, setAddNew] = useState(false);
  const db = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (dbState === undefined || !isUpdated) {
      return;
    }
    setPlaylistResult([]);
    db.current = dbState;
    const getAllReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .getAll();
    getAllReq.onsuccess = () => {
      setPlaylistResult(getAllReq.result);
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
    <div>
      {addNew ? null : (
        <span
          className="material-icons-round"
          id={styles.addButton}
          onClick={() => setAddNew(true)}
        >
          add
        </span>
      )}
      {addNew ? (
        <div>
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
          <span
            className="material-icons-round"
            id={
              newTitle.trim() === "" ? styles.doneDisabled : styles.doneButton
            }
            onClick={
              newTitle.trim() === ""
                ? null
                : () => {
                    setAddNew(false);
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
              setAddNew(false);
              setNewTitle("");
            }}
          >
            cancel
          </span>
        </div>
      ) : null}
      <div>
        {playlistResult.map((item, index) => (
          <div key={index}>
            {item.title} : {item.videoCount}
            <span
              className="material-icons-round"
              onClick={() => {
                navigate(`/playlist/${item.id}`, {
                  replace: location.pathname === `/playlist/${item.id}`,
                });
              }}
            >
              info_outline
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
