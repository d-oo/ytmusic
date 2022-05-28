import { useEffect, useState } from "react";
import LoadingMotion from "./LoadingMotion";
import SearchResult from "./SearchResult";

import styles from "./AddMusic.module.css";

function AddMusic() {
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

  //****************************************//
  //
  //Youtube Data API Search
  //
  //****************************************//

  useEffect(() => {
    async function videoReq() {
      if (videoId === "") {
        setVideoResult("UNDEFINED");
        return;
      }
      setLoading(true);
      const json = await (
        await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&type=video&id=${videoId}&key=${API_KEY}`
        )
      ).json();
      if (json.items[0] === undefined) {
        setVideoResult("UNDEFINED");
      } else {
        setVideoResult(
          <div className={styles.searchResult} id={styles.selected}>
            <SearchResult
              info={json.items[0].snippet}
              id={videoId}
              setVideoResult={setVideoResult}
              setVideoId={setVideoId}
              index={7}
            />
          </div>
        );
        setVideoDuration(json.items[0].contentDetails.duration);
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
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&type=video&q=${str}&key=${API_KEY}`
      )
    ).json();
    setSearchResults(
      json.items.map((item, index) => (
        <div key={index} className={styles.searchResult}>
          <SearchResult
            info={item.snippet}
            id={item.id.videoId}
            setVideoResult={setVideoResult}
            setVideoId={setVideoId}
            index={index}
          />
        </div>
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

  const dbReq = indexedDB.open("database", 1);
  let db;
  dbReq.onsuccess = (event) => {
    db = event.target.result;
  };

  dbReq.onerror = (event) => {
    const error = event.target.error;
    console.log("error", error.name);
  };

  dbReq.onupgradeneeded = (event) => {
    db = event.target.result;
    if (event.oldVersion < 1) {
      let objStore = db.createObjectStore("music", {
        keyPath: "id",
        autoIncrement: true,
      });
      objStore.createIndex("title", "title", { unique: false });
      //objStore.createIndex("title", "title", { unique: false });
      //objStore.createIndex("title", "title", { unique: false });
      objStore = db.createObjectStore("playlist", {
        keyPath: "id",
        autoIncrement: true,
      });
      objStore.createIndex("title", "title", { unique: true });
    }
  };

  const addData = () => {
    let store = db.transaction("music", "readwrite").objectStore("music");
    const artistToArray = artist.split(",").map((str) => str.trim());
    const tagToArray = tag.split(",").map((str) => str.trim());
    let addReq = store.add({
      title: title,
      artist: artistToArray,
      videoId: videoId,
      category: category,
      tag: tagToArray,
      duration: videoDuration,
      playCount: 0,
    });
    // addReq.onsuccess = (event) => {
    //   console.log(event);
    // };
  };

  const deleteData = () => {
    let store = db.transaction("music", "readwrite").objectStore("music");
    let deleteReq = store.delete(Number(prompt("id?")));
  };

  //****************************************//
  //
  //Event
  //
  //****************************************//

  const onSubmit = (event) => {
    addData();
    setTitle("");
    setArtist("");
    setVideoId("");
    setTag("");
  };

  return (
    <div>
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
        onChange={(event) => setTitle(event.target.value)}
        value={title}
        type="text"
        placeholder="Title"
      />
      <input
        onChange={(event) => setArtist(event.target.value)}
        value={artist}
        type="text"
        placeholder="Artist (아티스트가 없다면 none을 입력)"
      />
      <input
        onChange={(event) => setVideoId(event.target.value)}
        value={videoId}
        type="text"
        placeholder="Video ID"
      />
      <input
        onChange={(event) => setTag(event.target.value)}
        value={tag}
        type="text"
        placeholder="Tag"
      />
      <div>
        <span
          className="material-icons-round"
          id={styles.search}
          onClick={searchReq}
        >
          search
        </span>
        <button onClick={deleteData}>Delete Something</button>
      </div>
      {loading ? <LoadingMotion /> : null}
      <div id={styles.bigContainer}>
        {videoResult}
        {searchResults}
      </div>
      <button
        onClick={onSubmit}
        disabled={title === "" || artist === "" || videoResult === "UNDEFINED"}
      >
        Submit
      </button>
    </div>
  );
}

export default AddMusic;
