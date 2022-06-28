import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AppContext } from "../Home";

import PlayingMotion from "./PlayingMotion";
import PlaylistMusic from "./PlaylistMusic";

import styles from "./PlaylistInfo.module.css";

export default function PlaylistInfo() {
  const {
    playingPlaylistId,
    isPlaying,
    playlistResult,
    isUpdated,
    setIsUpdated,
    dbState,
  } = useContext(AppContext);
  const [selectedItem, setSelectedItem] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playlistInfo, setPlaylistInfo] = useState("");
  const [musicInfo, setMusicInfo] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();
  const resultRef = useRef();
  const { playlistId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setInfoAvailable(false);
    if (dbState === undefined || playlistId === "") {
      return;
    }
    db.current = dbState;
    const playlistInfoReq = db.current
      .transaction("playlist", "readonly")
      .objectStore("playlist")
      .get(Number(playlistId));
    playlistInfoReq.onsuccess = () => {
      setPlaylistInfo(playlistInfoReq.result);
      setIsUpdated(false);
      setInfoAvailable(true);
    };
  }, [dbState, playlistId, isUpdated, setIsUpdated]);

  useEffect(() => {
    setSelectedItem([]);
    setTotalDuration(0);
  }, [playlistId]);

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

  useEffect(() => {
    if (playlistInfo === "") {
      return;
    }
    if (playlistInfo.musicId.length === 0) {
      setMusicInfo([]);
    }
    const arr = [];
    playlistInfo.musicId.forEach((item, index) => {
      const musicInfoReq = db.current
        .transaction("music", "readonly")
        .objectStore("music")
        .get(item);
      musicInfoReq.onsuccess = () => {
        arr.push(musicInfoReq.result);
        if (index === playlistInfo.musicId.length - 1) {
          setMusicInfo(arr);
        }
      };
    });
  }, [playlistInfo]);

  useEffect(() => {
    return () => setIsUpdated(true);
  }, [setIsUpdated]);

  const addToPlaylist = (playlistInfo) => {
    console.log(playlistInfo.musicId);
    let duplicatedDuration = 0;
    selectedItem.forEach((sItem) => {
      if (playlistInfo.musicId.includes(sItem)) {
        duplicatedDuration +=
          musicInfo[musicInfo.findIndex((i) => i.id === sItem)].duration;
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

  const sortMusic = (result) => {
    if (!result.destination) {
      return;
    }
    if (
      result.destination.droppableId === result.source.droppableId &&
      result.destination.index === result.source.index
    ) {
      return;
    }
    const copiedArr = [...musicInfo];
    const [reorderedItem] = copiedArr.splice(result.source.index, 1);
    copiedArr.splice(result.destination.index, 0, reorderedItem);
    setMusicInfo(copiedArr);
    db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistInfo.title,
        musicId: copiedArr.map((item) => item.id),
        totalDuration: playlistInfo.totalDuration,
        videoCount: playlistInfo.videoCount,
        id: Number(playlistId),
      });
  };

  return (
    <div id={styles.playlistInfo}>
      <div id={styles.titleWrapper}>
        <span
          className="material-icons-round"
          id={styles.backButton}
          onClick={() => navigate(-1)}
        >
          arrow_back
        </span>
        재생목록 정보
      </div>
      {infoAvailable ? (
        <div>
          <div id={styles.playlistTitle}>
            {playlistInfo.title}&nbsp;&nbsp;&nbsp;
            {playlistId === playingPlaylistId ? (
              <PlayingMotion isPaused={!isPlaying} />
            ) : null}
          </div>
          <div id={styles.playlistResults}>
            <div id={styles.flexContainer}>
              <div
                id={styles.selectDiv}
                style={{
                  color: selectedItem.length === 0 ? "black" : "blue",
                }}
                onClick={
                  selectedItem.length === 0
                    ? () => {
                        let sum = 0;
                        setSelectedItem(
                          musicInfo.map((item) => {
                            sum += item.duration;
                            return item.id;
                          })
                        );
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
            <DragDropContext onDragEnd={sortMusic}>
              <Droppable droppableId="music">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {musicInfo.map((item, index) => (
                      <Draggable
                        key={"drag" + index}
                        draggableId={"drag" + index}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                          >
                            <PlaylistMusic
                              info={item}
                              index={index}
                              playlistInfo={playlistInfo}
                              selectedItem={selectedItem}
                              setSelectedItem={setSelectedItem}
                              setTotalDuration={setTotalDuration}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div id={styles.emptyArea}></div>
          </div>
        </div>
      ) : null}
      {selectedItem.length === 0 ? null : (
        <div id={styles.selectedMenu}>
          <div id={styles.selectedLength}>{selectedItem.length}</div>
          <span
            className="material-icons-round"
            id={styles.deleteButton}
            onClick={() => {
              console.log("delete");
            }}
          >
            delete
          </span>
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
                      onClick={
                        item.id === Number(playlistId)
                          ? null
                          : () => addToPlaylist(item)
                      }
                      style={
                        item.id === Number(playlistId)
                          ? { background: "lightgray", cursor: "default" }
                          : null
                      }
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
    </div>
  );
}
