import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AppContext } from "../Home";

import PlayingMotion from "./PlayingMotion";
import PlaylistMusic from "./PlaylistMusic";

import styles from "./PlaylistInfo.module.css";

export default function PlaylistInfo() {
  const {
    playSingle,
    secondToTime,
    playingPlaylistId,
    playingMusicId,
    playlistResult,
    setIsUpdated,
    dbState,
    alertFor,
  } = useContext(AppContext);
  const [selectedItem, setSelectedItem] = useState([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [playlistInfo, setPlaylistInfo] = useState("");
  const [musicInfo, setMusicInfo] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();
  const resultRef = useRef();
  const { playlistId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (
      dbState === undefined ||
      playlistId === "" ||
      playlistResult.length === 0
    ) {
      return;
    }
    if (isNaN(playlistId)) {
      navigate("/wrongplaylist", { replace: true });
      return;
    }
    db.current = dbState;
    const info =
      playlistResult[
        playlistResult.findIndex((i) => i.id === Number(playlistId))
      ];
    if (info === undefined) {
      navigate("/wrongplaylist", { replace: true });
      return;
    }
    setPlaylistInfo(info);
  }, [dbState, playlistId, playlistResult, navigate]);

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
      setPlaylistTitle(playlistInfo.title);
      setShowInput(false);
      setInfoAvailable(true);
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
          setInfoAvailable(true);
          setPlaylistTitle(playlistInfo.title);
          setShowInput(false);
        }
      };
    });
  }, [playlistInfo]);

  const addToPlaylist = (paramInfo) => {
    let duplicatedDuration = 0;
    selectedItem.forEach((sItem) => {
      if (paramInfo.musicId.includes(sItem)) {
        duplicatedDuration +=
          musicInfo[musicInfo.findIndex((i) => i.id === sItem)].duration;
      }
    });
    const selectedArr = [...new Set([...paramInfo.musicId, ...selectedItem])];
    const updateReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: paramInfo.title,
        musicId: selectedArr,
        totalDuration:
          paramInfo.totalDuration + totalDuration - duplicatedDuration,
        videoCount: selectedArr.length,
        id: paramInfo.id,
      });
    updateReq.onsuccess = () => {
      alertFor("addToPlaylist");
      setShowResult(false);
      setIsUpdated(true);
    };
  };

  const deleteFromPlaylist = () => {
    if (selectedItem.includes(Number(playingMusicId))) {
      playSingle(Number(playingMusicId));
    }
    const updateReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistInfo.title,
        musicId: playlistInfo.musicId.filter((i) => !selectedItem.includes(i)),
        totalDuration: playlistInfo.totalDuration - totalDuration,
        videoCount: playlistInfo.videoCount - selectedItem.length,
        id: playlistInfo.id,
      });
    updateReq.onsuccess = () => {
      setSelectedItem([]);
      setTotalDuration(0);
      alertFor("deleteFromPlaylist");
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
    const putReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistInfo.title,
        musicId: copiedArr.map((item) => item.id),
        totalDuration: playlistInfo.totalDuration,
        videoCount: playlistInfo.videoCount,
        id: Number(playlistId),
      });
    putReq.onsuccess = () => {
      setIsUpdated(true);
    };
  };

  const editTitle = () => {
    const putReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .put({
        title: playlistTitle,
        musicId: playlistInfo.musicId,
        totalDuration: playlistInfo.totalDuration,
        videoCount: playlistInfo.videoCount,
        id: Number(playlistId),
      });
    putReq.onsuccess = () => {
      alertFor("updatePlaylist");
      setIsUpdated(true);
    };
  };

  const deletePlaylist = () => {
    const deleteReq = db.current
      .transaction("playlist", "readwrite")
      .objectStore("playlist")
      .delete(Number(playlistId));
    deleteReq.onsuccess = () => {
      alertFor("deletePlaylist");
      navigate(-1);
      setIsUpdated(true);
    };
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
          <div id={styles.infoWrapper}>
            <div id={styles.playlistTitle}>
              {playlistId === playingPlaylistId ? (
                <div id={styles.playingMotion}>
                  <PlayingMotion />
                </div>
              ) : (
                <div id={styles.removeWrapper}>
                  <span
                    id={styles.removeButton}
                    className="material-icons-round"
                    onClick={deletePlaylist}
                  >
                    delete
                  </span>
                </div>
              )}
              {showInput ? (
                <div id={styles.inputDiv}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (playlistTitle.trim() === "") {
                        return;
                      }
                      setShowInput(false);
                      editTitle();
                      setPlaylistTitle(playlistTitle.trim());
                    }}
                  >
                    <input
                      id={styles.titleInput}
                      value={playlistTitle}
                      onChange={(event) => setPlaylistTitle(event.target.value)}
                      type="text"
                      spellCheck="false"
                      autoComplete="off"
                    />
                  </form>
                </div>
              ) : (
                playlistInfo.title
              )}
              {showInput ? (
                <div id={styles.doneCloseWrapper}>
                  <span
                    id={
                      playlistTitle.trim() === ""
                        ? styles.doneDisabled
                        : styles.doneButton
                    }
                    onClick={
                      playlistTitle.trim() === ""
                        ? null
                        : () => {
                            setShowInput(false);
                            editTitle();
                            setPlaylistTitle(playlistTitle.trim());
                          }
                    }
                    className="material-icons-round"
                  >
                    done
                  </span>
                  <span
                    id={styles.cancelButton}
                    className="material-icons-round"
                    onClick={() => {
                      setPlaylistTitle(playlistInfo.title);
                      setShowInput(false);
                    }}
                  >
                    close
                  </span>
                </div>
              ) : (
                <div id={styles.editWrapper}>
                  <span
                    id={styles.editButton}
                    className="material-icons-round"
                    onClick={() => setShowInput(true)}
                  >
                    edit
                  </span>
                </div>
              )}
            </div>
            {playlistInfo.videoCount}곡 /{" "}
            {secondToTime(playlistInfo.totalDuration)}
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
                              playlistId={playlistId}
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
            <div id={styles.emptyArea}>
              {musicInfo.length === 0 ? "재생목록에 곡을 추가해주세요" : null}
            </div>
          </div>
        </div>
      ) : null}
      {selectedItem.length === 0 ? null : (
        <div id={styles.selectedMenu}>
          <div id={styles.selectedLength}>{selectedItem.length}</div>
          <span
            className="material-icons-round"
            id={styles.deleteButton}
            onClick={deleteFromPlaylist}
          >
            playlist_remove
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
