import { useEffect, useState } from "react";
import LoadingMotion from "./LoadingMotion";
import SearchResult from "./SearchResult";
import Genres from "./Genres";

import styles from "./AddMusic.module.css";

function AddMusic() {
  const API_KEY = "AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY";
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(""); //!=AppContext.~
  const [artist, setArtist] = useState("");
  const [emptyAlert, setEmptyAlert] = useState("-");
  const [searchResults, setSearchResults] = useState("");
  const [videoResult, setVideoResult] = useState("-");
  const [videoId, setVideoId] = useState(""); //!=AppContext.~
  const [genresOn, setGenresOn] = useState(false);
  const [genre, setGenre] = useState("undefined");

  //Youtube Data API - Search
  useEffect(() => {
    async function videoReq() {
      if (videoId === "") {
        setVideoResult("-");
        return;
      }
      setLoading(true);
      const json = await (
        await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&type=video&id=${videoId}&key=${API_KEY}`
        )
      ).json();
      if (json.items[0] === undefined) {
        setVideoResult("UNDEFINED");
      } else {
        setVideoResult(
          <div className={styles.searchResult} id={styles.selected}>
            <SearchResult
              info={json.items[0].snippet}
              id={"selected " + videoId}
              setVideoResult={setVideoResult}
              setVideoId={setVideoId}
            />
          </div>
        );
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
          />
        </div>
      ))
    );
    if (videoId === "") {
      setVideoId(json.items[0].id.videoId);
    }
    setLoading(false);
  };

  //IndexedDB
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
    let addReq = store.add({
      title: title,
      artist: artist,
    });
    addReq.onsuccess = (event) => {
      console.log(event);
    };
  };

  const deleteData = () => {
    let store = db.transaction("music", "readwrite").objectStore("music");
    let deleteReq = store.delete(Number(prompt("id?")));
    deleteReq.onsuccess = (event) => console.log(event);
  };

  //Event
  const onTitleChange = (event) => {
    setTitle(event.target.value);
    setEmptyAlert("-");
  };

  const onArtistChange = (event) => {
    setArtist(event.target.value);
    setEmptyAlert("-");
  };
  const onVideoIdChange = (event) => {
    setVideoId(event.target.value);
    setEmptyAlert("-");
  };

  const onSubmit = (event) => {
    console.log("onSubmit");
    event.preventDefault();
    if (title === "") {
      setEmptyAlert("Title is Empty");
      return;
    }
    if (artist === "") {
      setEmptyAlert("Artist is Empty");
      return;
    }
    addData();
    setTitle("");
    setArtist("");
    setVideoId("");
  };

  return (
    <div>
      {genresOn ? (
        <Genres setGenresOn={setGenresOn} setGenre={setGenre} from="AddMusic" />
      ) : null}
      <p>{genre}</p>
      <input
        onChange={onTitleChange}
        value={title}
        type="text"
        placeholder="Title"
      />
      <input
        onChange={onArtistChange}
        value={artist}
        type="text"
        placeholder="Artist"
      />
      <input
        onChange={onVideoIdChange}
        value={videoId}
        type="text"
        placeholder="Video ID"
      />
      <div>{emptyAlert}</div>
      <span
        className="material-icons-round"
        id={styles.search}
        onClick={searchReq}
      >
        search
      </span>
      <button onClick={onSubmit}>Submit</button>
      <button onClick={deleteData}>Delete Something</button>
      <button onClick={() => setGenresOn(true)}>Genres</button>
      {loading ? <LoadingMotion /> : null}
      <div id={styles.bigContainer}>
        {videoResult}
        {searchResults}
      </div>
    </div>
  );
}

export default AddMusic;
