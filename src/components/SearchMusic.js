import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import AddMusic from "./AddMusic";
import MusicSearchResult from "./MusicSearchResult";
import styles from "./SearchMusic.module.css";

export default function SearchMusic() {
  const [showAddMusic, setShowAddMusic] = useState(() => {});
  const [result, setResult] = useState([]); //Musics Search Result
  const [showResult, setShowResult] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [searchBy, setSearchBy] = useState("title");
  const [category, setCategory] = useState("Song");
  const [sortBy, setSortBy] = useState("recentAdd");
  const db = useRef();
  const resultRef = useRef();
  const { dbState, isUpdated, setIsUpdated, playlistResult } =
    useContext(AppContext);

  useEffect(() => {
    console.log("SearchMusicEffect");
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
      }
    };
  }, [dbState, isUpdated]);

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
    console.log(playlistInfo.musicId);
    let duplicatedDuration = 0;
    selectedItem.forEach((sItem) => {
      if (playlistInfo.musicId.includes(sItem)) {
        duplicatedDuration +=
          result[result.findIndex((i) => i.id === sItem)].duration;
      }
    });
    const selectedArr = [
      ...new Set([...playlistInfo.musicId, ...selectedItem]),
    ];

    console.log(totalDuration);
    console.log(duplicatedDuration);

    const updateReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistInfo.title,
        musicId: selectedArr,
        totalDuration:
          playlistInfo.totalDuration + totalDuration - duplicatedDuration,
        videoCount: selectedArr.length,
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
    <div id={styles.bigContainer}>
      <input type="text" placeholder="검색" id={styles.searchInput} />
      <div id={styles.bigWrapper}>
        <div id={styles.funnel}>
          <div>
            <span
              className={searchBy === "title" ? styles.chosen : null}
              onClick={() => setSearchBy("title")}
            >
              &nbsp;제목&nbsp;
            </span>
            <span
              className={searchBy === "artist" ? styles.chosen : null}
              onClick={() => setSearchBy("artist")}
            >
              &nbsp;아티스트&nbsp;
            </span>
          </div>
          <div>
            <span
              className={category === "Song" ? styles.chosen : null}
              onClick={() => setCategory("Song")}
            >
              &nbsp;가요&nbsp;
            </span>
            <span
              className={category === "Inst" ? styles.chosen : null}
              onClick={() => setCategory("Inst")}
            >
              &nbsp;기악&nbsp;
            </span>
          </div>
          <div>
            <span
              className={
                sortBy === "recentAdd" ? styles.chosen : styles.notChosen
              }
              onClick={() => setSortBy("recentAdd")}
            >
              &nbsp;최근 추가&nbsp;
            </span>
            <span
              className={
                sortBy === "recentPlay" ? styles.chosen : styles.notChosen
              }
              onClick={() => setSortBy("recentPlay")}
            >
              &nbsp;최근 재생&nbsp;
            </span>
            <span
              className={
                sortBy === "mostPlay" ? styles.chosen : styles.notChosen
              }
              onClick={() => setSortBy("mostPlay")}
            >
              &nbsp;최다 재생&nbsp;
            </span>
          </div>
        </div>
        <div id={styles.flexContainer}>
          <div
            id={styles.selectDiv}
            style={{
              color: selectedItem.length === 0 ? "black" : "blue",
            }}
            onClick={
              selectedItem.length === 0
                ? () => {
                    setSelectedItem(result.map((item) => item.id));
                    let sum = 0;
                    result.forEach((item) => {
                      sum += item.duration;
                    });
                    setTotalDuration(sum);
                  }
                : () => {
                    setSelectedItem([]);
                    setTotalDuration(0);
                  }
            }
          >
            <span className="material-icons-round">done</span>
            {selectedItem.length === 0 ? "전체선택" : "선택해제"}
          </div>
          <div id={styles.titleDiv}>곡</div>
          <div id={styles.artistDiv}>아티스트</div>
          <div id={styles.infoDiv}>정보</div>
          <div id={styles.playDiv}>재생</div>
        </div>
        <div id={styles.searchResults}>
          {result.map((item, index) => (
            <MusicSearchResult
              key={index}
              info={item}
              index={index}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              setTotalDuration={setTotalDuration}
            />
          ))}
        </div>
        <div id={styles.emptyArea}></div>
      </div>
      {selectedItem.length === 0 ? null : (
        <div id={styles.selectedMenu}>
          <div id={styles.selectedLength}>{selectedItem.length}</div>
          <div id={styles.addToDiv}>
            <span
              className="material-icons-round"
              id={
                showResult ? styles.addToButtonBlack : styles.addToButtonWhite
              }
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
                  {playlistResult.map((item, index) => (
                    <div
                      key={index}
                      className={styles.result}
                      onClick={() => addToPlaylist(item)}
                    >
                      {item.title}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      <span
        className="material-icons-round"
        id={styles.addButton}
        onClick={() => showAddMusic(true)}
      >
        add
      </span>
      <AddMusic
        from="SearchMusic"
        showAddMusic={showAddMusic}
        setShowAddMusic={setShowAddMusic}
      />
    </div>
  );
}
