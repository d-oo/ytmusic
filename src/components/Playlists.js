import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import styles from "./Playlists.module.css";

export default function Playlists() {
  const { dbState, setShowPlaylist, setPlaylistId } = useContext(AppContext);
  const [newTitle, setNewTitle] = useState("");
  const [addNew, setAddNew] = useState(false);
  const [result, setResult] = useState([]);
  const [isUpdated, setIsUpdated] = useState(true);
  const db = useRef();

  useEffect(() => {
    if (dbState === undefined || !isUpdated) {
      return;
    }
    setResult([]);
    db.current = dbState;
    const cursorReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .openCursor();
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        setResult((prev) => [...prev, cursor.value]);
        cursor.continue();
      } else {
        setIsUpdated(false);
      }
    };
  }, [dbState, isUpdated]);

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
        {result.map((item, index) => (
          <div key={index}>
            {item.title} : {item.videoCount}
            <button
              onClick={() => {
                setShowPlaylist(true);
                setPlaylistId(item.id);
              }}
            >
              View
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
