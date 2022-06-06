import { useState, useEffect, useRef, useContext } from "react";
import { AppContext } from "../Home";
import LoadingMotion from "./LoadingMotion";
import VideoSearchResult from "./VideoSearchResult";

import styles from "./AddMusic.module.css";

export default function AddMusic({
  from,
  isAddMusicOn,
  setIsAddMusicOn,
  setIsUpdated,
  musicInfo,
}) {
  const API_KEY = "AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY";
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(""); //!=AppContext.~
  const [artist, setArtist] = useState("");
  const [searchResults, setSearchResults] = useState("");
  const [videoResult, setVideoResult] = useState("UNDEFINED");
  const [videoId, setVideoId] = useState(""); //!=AppContext.~
  const [category, setCategory] = useState("Song");
  const [tag, setTag] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [isArtistNone, setIsArtistNone] = useState(false);
  const [recommendedArtist, setRecommendedArtist] = useState([]);
  const [recommendedTag, setRecommendedTag] = useState([]);
  const db = useRef();
  const { dbState } = useContext(AppContext);

  useEffect(() => {
    db.current = dbState;
  }, [dbState]);

  useEffect(() => {
    if (from === "MusicInfo" && isAddMusicOn) {
      setTitle(musicInfo.title);
      setArtist(musicInfo.artist.join(","));
      setVideoId(musicInfo.videoId);
      setTag(musicInfo.tag.join(","));
    }
  }, [from, musicInfo, isAddMusicOn]);

  //****************************************//
  //
  //Youtube Data API: Videos & Search
  //
  //****************************************//

  useEffect(() => {
    async function videoReq() {
      if (videoId === "") {
        setVideoResult("UNDEFINED");
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
        setVideoResult("UNDEFINED");
      } else {
        setVideoResult(
          <div id={styles.selected}>
            <VideoSearchResult
              info={json.items[0].snippet}
              id={videoId}
              setVideoId={setVideoId}
              index={7}
            />
          </div>
        );

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
    const str = title + " " + artist;
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
        tag: tagArray,
        duration: videoDuration,
        playCount: 0,
        recentPlay: 0,
      });
    addReq.onsuccess = () => {
      console.log("succefully added!");
      //이 부분에 추가 완료 알림창 띄움
      reset();
    };
    addReq.onerror = () => {
      if (addReq.error.name === "ConstraintError") {
        console.log("already existing video ID");
        //이 부분에 해당 비디오를 사용하는 음악이 이미 존재한다는 알림창 띄움
      } else {
        console.log(addReq.error);
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
        id: musicInfo.id,
        title: title,
        artist: artistArray,
        videoId: videoId,
        category: category,
        tag: tagArray,
        duration: videoDuration,
        playCount: musicInfo.playCount,
        recentPlay: musicInfo.recentPlay,
      });
    putReq.onsuccess = () => {
      setIsUpdated(true);
      console.log("succefully updated!");
      //이 부분에 업데이트 완료 알림창 띄움
      closeAddMusic();
    };
    putReq.onerror = () => {
      if (putReq.error.name === "ConstraintError") {
        console.log("already existing video ID");
        //이 부분에 해당 비디오를 사용하는 음악이 이미 존재한다는 알림창 띄움
      } else {
        console.log(putReq.error);
      }
    };
  };

  useEffect(() => {
    setSearchResults("");
    setRecommendedArtist([]);
    if (artist === "") {
      return;
    }
    let count = 0;
    const artistArr = artist.split(",");
    const artistArray = artistArr.map((item) =>
      item.replace(/\./g, "").replace(/ /g, "")
    );
    const store = db.current
      .transaction("music", "readonly")
      .objectStore("music");
    const cursorReq = store.index("artist").openCursor(null, "nextunique");
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        const dbStr = cursor.key.replace(/\./g, "").replace(/ /g, "");
        const lastArtist = artistArray[artistArray.length - 1];
        if (
          dbStr.includes(lastArtist) &&
          dbStr !== artistArr[artistArr.length - 1] &&
          lastArtist !== ""
        ) {
          setRecommendedArtist((prev) => [...prev, cursor.key]);
          count += 1;
        }
        if (count < 5) {
          cursor.continue();
        }
      }
    };
  }, [artist]);

  useEffect(() => {
    setRecommendedTag([]);
    if (tag === "") {
      return;
    }
    let count = 0;
    const tagArr = tag.split(",");
    const tagArray = tagArr.map((item) =>
      item.replace(/\./g, "").replace(/ /g, "")
    );
    const store = db.current
      .transaction("music", "readonly")
      .objectStore("music");
    const cursorReq = store.index("tag").openCursor(null, "nextunique");
    cursorReq.onsuccess = () => {
      const cursor = cursorReq.result;
      if (cursor) {
        const dbStr = cursor.key.replace(/\./g, "").replace(/ /g, "");
        const lastTag = tagArray[tagArray.length - 1];
        if (
          dbStr.includes(lastTag) &&
          dbStr !== tagArr[tagArr.length - 1] &&
          lastTag !== ""
        ) {
          setRecommendedTag((prev) => [...prev, cursor.key]);
          count += 1;
        }
        if (count < 5) {
          cursor.continue();
        }
      }
    };
  }, [tag]);

  //****************************************//
  //
  //Event & Return
  //
  //****************************************//

  const reset = () => {
    setTitle("");
    setArtist("");
    setVideoId("");
    setTag("");
    setIsArtistNone(false);
  };

  const onSubmit = () => {
    if (from === "MusicInfo") {
      updateData();
    } else {
      addData();
    }
  };

  const closeAddMusic = () => {
    reset();
    setCategory("Song");
    setIsAddMusicOn(false);
  };

  useEffect(() => setSearchResults(""), [title]);

  return (
    <div
      id={styles.bigContainer}
      className={isAddMusicOn ? styles.notHidden : styles.hidden}
    >
      <span
        className="material-icons-round"
        id={styles.closeButton}
        onClick={closeAddMusic}
      >
        close
      </span>
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
            Song
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
            Instrumental
          </label>
        </div>
      </div>
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
      <div>
        {category === "Inst" ? (
          <label>
            <input
              type="checkbox"
              value={isArtistNone}
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
            None
          </label>
        ) : null}
      </div>
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
      <input
        onChange={(event) => setVideoId(event.target.value)}
        value={videoId}
        type="text"
        placeholder="Video ID"
        spellCheck="false"
        autoComplete="off"
      />
      <input
        onChange={(event) => setTag(event.target.value)}
        value={tag}
        type="text"
        placeholder="Tag"
        spellCheck="false"
        autoComplete="off"
      />
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
      <div>
        <span
          className="material-icons-round"
          id={
            title.trim() === "" || artist.trim() === ""
              ? styles.searchDisabled
              : styles.searchButton
          }
          onClick={
            title.trim() === "" || artist.trim() === "" ? null : searchReq
          }
        >
          search
        </span>
      </div>
      {loading ? <LoadingMotion /> : null}
      <div id={styles.smallContainer}>
        {videoResult}
        {searchResults}
      </div>
      <span
        className="material-icons-round"
        id={
          title.trim() === "" ||
          artist.trim() === "" ||
          videoResult === "UNDEFINED"
            ? styles.doneDisabled
            : styles.doneButton
        }
        onClick={
          title.trim() === "" ||
          artist.trim() === "" ||
          videoResult === "UNDEFINED"
            ? null
            : onSubmit
        }
      >
        done
      </span>
    </div>
  );
}
