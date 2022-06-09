import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import AddMusic from "./AddMusic";
import MusicSearchResult from "./MusicSearchResult";
import styles from "./SearchMusic.module.css";

export default function SearchMusic() {
  const [isAddMusicOn, setIsAddMusicOn] = useState(false);
  const [result, setResult] = useState([]);
  const db = useRef();
  const { dbState, isUpdated, setIsUpdated } = useContext(AppContext);

  useEffect(() => {
    if (dbState === undefined || !isUpdated) {
      return;
    }
    db.current = dbState;
    setResult([]);
    const cursorReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
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
  }, [dbState, isUpdated, setIsUpdated]);

  const AddMusicOn = () => setIsAddMusicOn(true);

  return (
    <div id={styles.bigContainer}>
      <div id={styles.flexContainer}>
        <div id={styles.imgDiv}></div>
        <div id={styles.titleDiv}>Title</div>
        <div id={styles.artistDiv}>Artist</div>
        <div id={styles.infoDiv}>Info</div>
        <div id={styles.playDiv}>Play</div>
        <div id={styles.addToDiv}>Add To</div>
      </div>
      <div>
        {result.map((item, index) => (
          <MusicSearchResult key={index} info={item} index={index} />
        ))}
      </div>
      <div id={styles.emptyArea}></div>
      <span
        className="material-icons-round"
        id={styles.addButton}
        onClick={AddMusicOn}
      >
        add
      </span>
      <AddMusic
        from="SearchMusic"
        isAddMusicOn={isAddMusicOn}
        setIsAddMusicOn={setIsAddMusicOn}
      />
    </div>
  );
}
