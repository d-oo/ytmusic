import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import LoadingMotion from "./LoadingMotion";
import VideoSearchResult from "./VideoSearchResult";
import Modal from "./Modal";

import styles from "./AddMusic.module.css";

export default function AddMusic({
  from,
  showAddMusic,
  setShowAddMusic,
  setModalState,
  musicInfo,
}) {
  const API_KEY = "AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY";
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(""); //!=AppContext.~
  const [artist, setArtist] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [videoResult, setVideoResult] = useState("UNDEFINED");
  const [videoId, setVideoId] = useState(""); //!=AppContext.~
  const [isVideoValid, setIsVideoValid] = useState(false);
  const [category, setCategory] = useState("Song");
  const [tag, setTag] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [isArtistNone, setIsArtistNone] = useState(false);
  const [recommendedArtist, setRecommendedArtist] = useState([]);
  const [recommendedTag, setRecommendedTag] = useState([]);
  const db = useRef();
  const { dbState, setIsUpdated, alertFor } = useContext(AppContext);

  useEffect(() => {
    db.current = dbState;
  }, [dbState]);

  useEffect(() => {
    if (from === "MusicInfo") {
      setTitle(musicInfo.title);
      setArtist(musicInfo.artist.join(","));
      setVideoId(musicInfo.videoId);
      setTag(musicInfo.tag.join(","));
      setCategory(musicInfo.category);
      setIsArtistNone(musicInfo.artist.join(",") === "None");
    }
  }, [from, musicInfo]);

  //****************************************//
  //
  //Youtube Data API: Videos & Search
  //
  //****************************************//

  useEffect(() => {
    async function videoReq() {
      if (videoId === "") {
        setVideoResult(<div id={styles.undefinedVideo}>UNDEFINED</div>);
        setIsVideoValid(false);
        setVideoDuration("");
        return;
      }
      setLoading(true);
      const json = await (
        await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&fields=items(snippet(thumbnails,title,channelTitle),contentDetails/duration)&type=video&id=${videoId}&key=${API_KEY}`
        )
      ).json();
      if (json.items[0] === undefined) {
        setVideoResult(<div id={styles.undefinedVideo}>UNDEFINED</div>);
        setIsVideoValid(false);
      } else {
        setVideoResult(
          <div id={styles.selected}>
            <VideoSearchResult
              info={json.items[0].snippet}
              id={videoId}
              setVideoId={setVideoId}
              index={7}
              isSelected={true}
            />
          </div>
        );
        setIsVideoValid(true);

        //videoDuration converting
        const durationStr = json.items[0].contentDetails.duration;
        let tmpStr = durationStr.replace("PT", "");
        let h, m, s;
        if (!tmpStr.includes("H")) {
          h = 0;
        } else {
          h = Number(tmpStr.split("H")[0]);
          tmpStr = tmpStr.split("H")[1];
        }
        if (!tmpStr.includes("M")) {
          m = 0;
        } else {
          m = Number(tmpStr.split("M")[0]);
          tmpStr = tmpStr.split("M")[1];
        }
        if (!tmpStr.includes("S")) {
          s = 0;
        } else {
          s = Number(tmpStr.split("S")[0]);
        }
        setVideoDuration(h * 3600 + m * 60 + s);
      }
      setLoading(false);
    }
    videoReq();
  }, [videoId]);

  const searchReq = async () => {
    setLoading(true);
    const str = title + " " + (isArtistNone ? "" : artist);
    const json = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&fields=items(id/videoId,snippet(thumbnails,title,channelTitle))&maxResults=5&type=video&q=${str}&key=${API_KEY}`
      )
    ).json();
    setSearchResults(
      json.items.map((item, index) => (
        <VideoSearchResult
          key={index}
          info={item.snippet}
          id={item.id.videoId}
          setVideoId={setVideoId}
          index={index}
          isSelected={false}
        />
      ))
    );
    if (videoId === "") {
      setVideoId(json.items[0].id.videoId);
    }
    setLoading(false);
  };

  //****************************************//
  //
  //IndexedDB
  //
  //****************************************//

  const addData = () => {
    const artistArray = [
      ...new Set(
        artist.split(",").map((str) => str.trim().replace(/ +(?= )/g, ""))
      ),
    ];
    const tagArray = [
      ...new Set(
        tag.split(",").map((str) => str.trim().replace(/ +(?= )/g, ""))
      ),
    ];
    const addReq = db.current
      .transaction("music", "readwrite")
      .objectStore("music")
      .add({
        title: title,
        artist: artistArray,
        videoId: videoId,
        category: category,
        tag: tagArray[0] === "" ? [] : tagArray,
        duration: videoDuration,
        playCount: 0,
        recentPlay: 0,
      });
    addReq.onsuccess = () => {
      setIsUpdated(true);
      alertFor("addMusic");
      reset();
    };
    addReq.onerror = () => {
      if (addReq.error.name === "ConstraintError") {
        alertFor("addMusicF");
      } else {
        alertFor(addReq.error.name);
      }
    };
  };

  const updateData = () => {
    const artistArray = [
      ...new Set(
        artist.split(",").map((str) => str.trim().replace(/ +(?= )/g, ""))
      ),
    ];
    const tagArray = [
      ...new Set(
        tag.split(",").map((str) => str.trim().replace(/ +(?= )/g, ""))
      ),
    ];
    const putReq = db.current
      .transaction("music", "readwrite")
      .objectStore("music")
      .put({
        title: title,
        artist: artistArray,
        videoId: videoId,
        category: category,
        tag: tagArray[0] === "" ? [] : tagArray,
        duration: videoDuration,
        playCount: musicInfo.playCount,
        recentPlay: musicInfo.recentPlay,
        id: musicInfo.id,
      });
    putReq.onsuccess = () => {
      setIsUpdated(true);
      alertFor("updateMusic");
      closeAddMusic();
    };
    putReq.onerror = () => {
      if (putReq.error.name === "ConstraintError") {
        alertFor("addMusicF");
      } else {
        alertFor(putReq.error.name);
      }
    };
  };

  useEffect(() => {
    setSearchResults("");
    let tmpArr = [];
    let count = 0;
    const artistArr = artist.split(",");
    const artistArray = artistArr.map((item) =>
      item.replace(/\./g, "").replace(/ /g, "").toLowerCase()
    );
    const lastArtist = artistArray[artistArray.length - 1];
    if (lastArtist === "") {
      setRecommendedArtist([]);
      return;
    }
    const store = db.current
      .transaction("music", "readonly")
      .objectStore("music");
    const cursorReq = store.index("artist").openCursor(null, "nextunique");
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor && count < 5) {
        const dbString = cursor.key;
        const dbStr = dbString
          .replace(/\./g, "")
          .replace(/ /g, "")
          .toLowerCase();
        if (
          dbStr.includes(lastArtist) &&
          dbString !== artistArr[artistArr.length - 1] &&
          lastArtist !== ""
        ) {
          tmpArr.push(cursor.key);
          count += 1;
        }
        cursor.continue();
      } else {
        setRecommendedArtist(tmpArr);
      }
    };
  }, [artist]);

  useEffect(() => {
    let tmpArr = [];
    let count = 0;
    const tagArr = tag.split(",");
    const tagArray = tagArr.map((item) =>
      item.replace(/\./g, "").replace(/ /g, "").toLowerCase()
    );
    const lastTag = tagArray[tagArray.length - 1];
    if (lastTag === "") {
      setRecommendedTag([]);
      return;
    }
    const store = db.current
      .transaction("music", "readonly")
      .objectStore("music");
    const cursorReq = store.index("tag").openCursor(null, "nextunique");
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor && count < 5) {
        const dbString = cursor.key;
        const dbStr = dbString
          .replace(/\./g, "")
          .replace(/ /g, "")
          .toLowerCase();
        if (
          dbStr.includes(lastTag) &&
          dbString !== tagArr[tagArr.length - 1] &&
          lastTag !== ""
        ) {
          tmpArr.push(cursor.key);
          count += 1;
        }
        cursor.continue();
      } else {
        setRecommendedTag(tmpArr);
      }
    };
  }, [tag]);

  //****************************************//
  //
  //Event & Return
  //
  //****************************************//

  const reset = () => {
    if (from === "MusicInfo") {
      setTitle(musicInfo.title);
      setArtist(musicInfo.artist.join(","));
      setVideoId(musicInfo.videoId);
      setTag(musicInfo.tag.join(","));
      setCategory(musicInfo.category);
      setIsArtistNone(musicInfo.artist.join(",") === "None");
    } else {
      setTitle("");
      setArtist("");
      setVideoId("");
      setTag("");
      setIsArtistNone(false);
    }
  };

  const closeAddMusic = () => {
    reset();
    showAddMusic(false);
  };

  const onSubmit = () => {
    if (from === "MusicInfo") {
      updateData();
    } else {
      addData();
    }
  };

  useEffect(() => setSearchResults(""), [title]);

  useEffect(() => {
    if (category === "Song" && isArtistNone) {
      setArtist("");
      setIsArtistNone(false);
    }
  }, [category, isArtistNone]);

  return (
    <Modal setHandleFunction={setShowAddMusic} setModalState={setModalState}>
      <div id={styles.bigContainer}>
        <div id={styles.titleWrapper}>
          <span
            className="material-icons-round"
            id={styles.closeButton}
            onClick={() => closeAddMusic()}
          >
            close
          </span>
          {from === "MusicInfo" ? "음악 수정" : "음악 추가"}
        </div>
        <div className={styles.radioContainer}>
          <div className={styles.radio}>
            <input
              type="radio"
              name="kind"
              value={category}
              id="Song"
              checked={category === "Song"}
              onChange={() => setCategory("Song")}
            />
            <label htmlFor="Song" id={styles.Song}>
              가요
            </label>
          </div>
          <div className={styles.radio}>
            <input
              type="radio"
              name="kind"
              value={category}
              id="Inst"
              checked={category === "Inst"}
              onChange={() => setCategory("Inst")}
            />
            <label htmlFor="Inst" id={styles.Inst}>
              기악
            </label>
          </div>
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.textLabel}>제목</div>
          <input
            onChange={(event) => {
              setTitle(event.target.value);
            }}
            value={title}
            type="text"
            placeholder="Title"
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.textLabel}>아티스트</div>
          <input
            onChange={(event) => {
              setArtist(event.target.value);
            }}
            value={artist}
            type="text"
            placeholder="Artist"
            spellCheck="false"
            disabled={isArtistNone}
            autoComplete="off"
          />
        </div>
        {category === "Inst" ? (
          <div id={styles.noneWrapper}>
            <label>
              <input
                type="checkbox"
                value={isArtistNone}
                checked={isArtistNone}
                autoComplete="off"
                onChange={() => {
                  if (!isArtistNone) {
                    setArtist("None");
                  } else {
                    setArtist("");
                  }
                  setIsArtistNone((prev) => !prev);
                }}
              />
              아티스트 없음
            </label>
          </div>
        ) : null}
        <div className={styles.recommendContainer}>
          {recommendedArtist.map((item, index) => (
            <div
              key={"new" + index}
              className={styles.recommend}
              onClick={() => {
                const artistArray = artist.split(",");
                artistArray[artistArray.length - 1] = item;
                setArtist(artistArray.join(","));
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.textLabel}>비디오 ID</div>
          <input
            onChange={(event) => setVideoId(event.target.value)}
            value={videoId}
            type="text"
            placeholder="Video ID"
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div className={styles.inputWrapper}>
          <div className={styles.textLabel}>태그</div>
          <input
            onChange={(event) => setTag(event.target.value)}
            value={tag}
            type="text"
            placeholder="Tag"
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div className={styles.recommendContainer}>
          {recommendedTag.map((item, index) => (
            <div
              key={"new" + index}
              className={styles.recommend}
              onClick={() => {
                const tagArray = tag.split(",");
                tagArray[tagArray.length - 1] = item;
                setTag(tagArray.join(","));
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <span
          className="material-icons-round"
          id={
            title.trim() === "" ||
            artist.split(",").filter((item) => item.trim() === "").length !== 0
              ? styles.searchDisabled
              : styles.searchButton
          }
          onClick={
            title.trim() === "" ||
            artist.split(",").filter((item) => item.trim() === "").length !== 0
              ? null
              : searchReq
          }
        >
          search
        </span>
        {loading ? <LoadingMotion /> : null}
        <div id={styles.smallContainer}>
          {videoResult}
          {searchResults}
        </div>
        <div id={styles.doneBigWrapper}>
          <div
            className={styles.doneSmallWrapper}
            id={
              title.trim() === "" ||
              artist.split(",").filter((item) => item.trim() === "").length !==
                0 ||
              (tag.split(",").filter((item) => item.trim() === "").length !==
                0 &&
                tag !== "") ||
              !isVideoValid
                ? styles.doneDisabled
                : styles.doneDiv
            }
            onClick={
              title.trim() === "" ||
              artist.split(",").filter((item) => item.trim() === "").length !==
                0 ||
              (tag.split(",").filter((item) => item.trim() === "").length !==
                0 &&
                tag !== "") ||
              !isVideoValid
                ? null
                : onSubmit
            }
          >
            <span className="material-icons-round" id={styles.doneButton}>
              done
            </span>
            확인
          </div>
        </div>
      </div>
    </Modal>
  );
}
