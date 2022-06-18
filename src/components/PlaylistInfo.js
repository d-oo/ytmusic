import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { AppContext } from "../Home";

import styles from "./PlaylistInfo.module.css";

export default function PlaylistInfo() {
  const { isUpdated, setIsUpdated, dbState } = useContext(AppContext);
  const [playlistInfo, setPlaylistInfo] = useState("");
  const [musicInfo, setMusicInfo] = useState([]);
  const [infoAvailable, setInfoAvailable] = useState(false);
  const db = useRef();
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
    console.log("A");
    if (playlistInfo === "") {
      return;
    }
    console.log(playlistInfo);
    const arr = [];
    console.log(playlistInfo.musicId.length);
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
  };

  return (
    <div id={styles.playlistInfo}>
      <span className="material-icons-round" onClick={() => navigate(-1)}>
        arrow_back
      </span>
      {infoAvailable ? (
        <div>
          <div>{playlistInfo.title}</div>
          <DragDropContext onDragEnd={sortMusic}>
            <Droppable droppableId="music">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    backgroundColor: snapshot.isDragging ? "grey" : "lightgrey",
                    fontSize: 18,
                    ...provided.droppableProps.style,
                  }}
                >
                  {musicInfo.map((item, index) => (
                    <Draggable
                      key={"drag" + index}
                      draggableId={"drag" + index}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          style={{
                            borderBottom: "1px solid black",
                            backgroundColor: snapshot.isDragging
                              ? "blue"
                              : "skyblue",
                            fontSize: 18,
                            ...provided.draggableProps.style,
                          }}
                        >
                          {item.videoId}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      ) : null}
    </div>
  );
}
