import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import AddMusic from "./AddMusic";
import MusicSearchResult from "./MusicSearchResult";
import styles from "./SearchMusic.module.css";

export default function SearchMusic() {
  const [dataEmpty, setDataEmpty] = useState(false);
  const [showAddMusic, setShowAddMusic] = useState(() => {});
  const [loadCount, setLoadCount] = useState(1);
  const [loadEnd, setLoadEnd] = useState(false);
  const [result, setResult] = useState([]); //Musics Search Result
  const [showResult, setShowResult] = useState(false);
  const [selectedItem, setSelectedItem] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [searchBy, setSearchBy] = useState(false); //"title", "artist"
  const [category, setCategory] = useState("Song");
  const [sortBy, setSortBy] = useState("recentAdd"); //"recentAdd", "recentPlay", "mostPlay", false
  const [searchInput, setSearchInput] = useState("");
  const [searchInputDone, setSearchInputDone] = useState("");
  const db = useRef();
  const resultRef = useRef();
  const scrollRef = useRef();
  const {
    searchScroll,
    setSearchScroll,
    dbState,
    isUpdated,
    setIsUpdated,
    playlistResult,
    alertFor,
  } = useContext(AppContext);

  useEffect(() => {
    if (dbState === undefined) {
      return;
    }
    db.current = dbState;
    const transaction = db.current
      .transaction("music", "readonly")
      .objectStore("music");

    const tmpResult = [];
    let count = 0;

    //검색어가 없을 때
    if (searchInputDone.trim() === "") {
      const countReq = transaction.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) {
          setDataEmpty(true);
        } else {
          setDataEmpty(false);
        }
      };
      if (searchBy) {
        setSearchBy(false);
        setSortBy("recentAdd");
        return;
      }
      if (sortBy === "recentAdd") {
        const cursorReq = transaction.openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && count < 20 * loadCount) {
            if (cursor.value.category === category) {
              tmpResult.push(cursor.value);
              count++;
            }
            cursor.continue();
          } else {
            if (!cursor) {
              setLoadEnd(true);
            }
            setResult(tmpResult);
          }
        };
      } else if (sortBy === "recentPlay") {
        const cursorReq = transaction
          .index("recentPlay")
          .openCursor(null, "prev");
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && count < 20 * loadCount) {
            if (
              cursor.value.recentPlay !== 0 &&
              cursor.value.category === category
            ) {
              tmpResult.push(cursor.value);
              count++;
            }
            cursor.continue();
          } else {
            if (!cursor) {
              setLoadEnd(true);
            }
            setResult(tmpResult);
          }
        };
      } else if (sortBy === "mostPlay") {
        const cursorReq = transaction
          .index("playCount")
          .openCursor(null, "prev");
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && count < 20 * loadCount) {
            if (cursor.value.category === category) {
              tmpResult.push(cursor.value);
              count++;
            }
            cursor.continue();
          } else {
            if (!cursor) {
              setLoadEnd(true);
            }
            setResult(tmpResult);
          }
        };
      }
    }

    //검색어가 있을 때
    else {
      if (sortBy) {
        setSearchBy("title");
        setSortBy(false);
        return;
      }
      const sharp = searchInputDone[0] === "#";
      const inputStr = searchInputDone
        .replace(/\./g, "")
        .replace(/ /g, "")
        .toLowerCase();
      setSearchInput(searchInputDone.trim());
      if (searchBy === "title") {
        if (sharp) {
          const cursorReq = transaction.index("tag").openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && count < 20 * loadCount) {
              const dbStr = cursor.key
                .replace(/\./g, "")
                .replace(/ /g, "")
                .toLowerCase();
              if (
                cursor.value.category === category &&
                dbStr === inputStr.slice(1)
              ) {
                tmpResult.push(cursor.value);
                count++;
              }
              cursor.continue();
            } else {
              if (!cursor) {
                setLoadEnd(true);
              }
              setResult(tmpResult);
            }
          };
        } else {
          const cursorReq = transaction.openCursor();
          cursorReq.onsuccess = () => {
            const cursor = cursorReq.result;
            if (cursor && count < 20 * loadCount) {
              const dbStr = cursor.value.title
                .replace(/\./g, "")
                .replace(/ /g, "")
                .toLowerCase();
              if (
                cursor.value.category === category &&
                dbStr.includes(inputStr)
              ) {
                if (dbStr === inputStr) {
                  tmpResult.unshift(cursor.value);
                } else {
                  tmpResult.push(cursor.value);
                }
                count++;
              }
              cursor.continue();
            } else {
              if (!cursor) {
                setLoadEnd(true);
              }
              setResult(tmpResult);
            }
          };
        }
      } else if (searchBy === "artist") {
        const cursorReq = transaction.index("artist").openCursor();
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && count < 20 * loadCount) {
            const dbStr = cursor.key
              .replace(/\./g, "")
              .replace(/ /g, "")
              .toLowerCase();
            if (
              cursor.value.category === category &&
              (sharp ? dbStr === inputStr.slice(1) : dbStr.includes(inputStr))
            ) {
              if (!tmpResult.some((i) => i.id === cursor.value.id)) {
                tmpResult.push(cursor.value);
                count++;
              }
            }
            cursor.continue();
          } else {
            if (!cursor) {
              setLoadEnd(true);
            }
            console.log(count);
            setResult(tmpResult);
          }
        };
      }
    }
  }, [
    dbState,
    isUpdated,
    searchInputDone,
    searchBy,
    sortBy,
    category,
    loadCount,
  ]);

  useEffect(() => {
    console.log("setloadcount");
    setLoadCount(1);
    setLoadEnd(false);
    setSelectedItem([]);
    setTotalDuration(0);
  }, [searchInputDone, searchBy, sortBy, category]);

  // useEffect(() => {
  //   setTimeout(
  //     () =>
  //       scrollRef.current.scrollTo({
  //         top: searchScroll,
  //         left: 0,
  //         behavior: "smooth",
  //       }),
  //     500
  //   );
  //   console.log(scrollRef.current);
  //   console.log(searchScroll);
  // }, []);

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
      alertFor("addToPlaylist");
      setShowResult(false);
      setIsUpdated(true);
    };
  };

  return (
    <div
      id={styles.bigContainer}
      ref={scrollRef}
      onScroll={(event) => {
        setSearchScroll(event.target.scrollTop);
      }}
    >
      <div id={styles.inputDiv}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearchInputDone(searchInput);
          }}
        >
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="검색"
            id={styles.searchInput}
            spellCheck="false"
            autoComplete="off"
          />
        </form>
        <span
          className="material-icons-round"
          id={styles.searchButton}
          onClick={() => setSearchInputDone(searchInput)}
        >
          search
        </span>
      </div>
      <div id={styles.funnel}>
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
        {searchBy ? (
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
        ) : (
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
        )}
      </div>
      <div id={styles.bigWrapper}>
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
        <div id={styles.emptyArea}>
          {dataEmpty
            ? "+ 버튼을 눌러 음악을 추가해주세요"
            : result.length === 0
            ? "검색 결과가 없습니다"
            : null}
          {loadEnd ? null : (
            <span
              id={styles.loadButton}
              onClick={() => setLoadCount((prev) => prev + 1)}
            >
              <div>더 보기</div>
              <span className="material-icons-round">expand_more</span>
            </span>
          )}
        </div>
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
        id={searchScroll > 200 ? styles.upActive : styles.upDisabled}
        className={`material-icons-round ${styles.upButton}`}
        onClick={() => {
          scrollRef.current.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        }}
      >
        arrow_upward
      </span>
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
