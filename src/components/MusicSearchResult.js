import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import styles from "./MusicSearchResult.module.css";

export default function MusicSearchResult({ info, index }) {
  const { setShowInfo, setInfoId, setVideoId, setVideoOn, setTitle, dbState } =
    useContext(AppContext);
  const [result, setResult] = useState([]);
  const [position, setPosition] = useState([0, 0]);
  const selectStyle = useRef();
  const db = useRef();

  useEffect(() => {
    db.current = dbState;
  }, [dbState]);

  const addToPlaylist = () => {
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
      }
    };
    // const addReq = db.current
    //   .transaction("music", "readwrite")
    //   .objectStore("music")
    //   .add({
    //     title: title,
    //     artist: artistArray,
    //     videoId: videoId,
    //     category: category,
    //     tag: tagArray,
    //     duration: videoDuration,
    //     playCount: 0,
    //     recentPlay: 0,
    //   });
    // addReq.onsuccess = () => {
    //   console.log("succefully added!");
    //   //이 부분에 추가 완료 알림창 띄움
    //   reset();
    // };
    // addReq.onerror = () => {
    //   if (addReq.error.name === "ConstraintError") {
    //     console.log("already existing video ID");
    //     //이 부분에 해당 비디오를 사용하는 음악이 이미 존재한다는 알림창 띄움
    //   } else {
    //     console.log(addReq.error);
    //   }
    // };
  };

  useEffect(() => {
    if (position[0] === 0) {
      return;
    }
    selectStyle.current.style.top = `${position[1]}px`;
    selectStyle.current.style.left = `${position[0]}px`;
  }, [position]);

  return (
    <div className={styles.container}>
      <img
        alt={index}
        src={`https://i.ytimg.com/vi/${info.videoId}/default.jpg`}
      />
      {info.title} by {info.artist.join(", ")}
      <button
        onClick={() => {
          setInfoId(info.videoId);
          setShowInfo(true);
        }}
      >
        Info
      </button>
      <button
        onClick={() => {
          setVideoId(info.videoId);
          setVideoOn(true);
          setTitle(info.title);
        }}
      >
        Play
      </button>
      <button
        onClick={(event) => {
          setPosition([event.clientX, event.clientY]);
          addToPlaylist();
        }}
      >
        AddToPlaylist
      </button>
      <div id={styles.results} ref={selectStyle}>
        {result.map((item, index) => (
          <div key={index} id={styles.result}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}
