import { useState } from "react";
import LoadingMotion from "./LoadingMotion";
import SearchResult from "./SearchResult";
import styles from "./AddMusic.module.css";

function AddMusic() {
  const API_KEY = "AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY";
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [emptyAlert, setEmptyAlert] = useState("-");
  const [searchResults, setSearchResults] = useState("");
  //Youtube Data API - Search
  const searchReq = async () => {
    setLoading(true);
    const str = title + " " + artist;
    const json = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&type=video&q=${str}&key=${API_KEY}`
      )
    ).json();
    setSearchResults(
      json.items.map((item, index) => (
        <div key={index} className={styles.searchResult}>
          <SearchResult info={item.snippet} id={item.id.videoId} />
        </div>
      ))
    );
    console.log(json.items[1]);
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
    let oldVersion = event.oldVersion;
    if (oldVersion < 1) {
      db.createObjectStore("music", { keyPath: "id", autoIncrement: true });
      db.createObjectStore("playlist", { keyPath: "id", autoIncrement: true });
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

  //
  const onTitleChange = (event) => {
    setTitle(event.target.value);
    setEmptyAlert("-");
  };

  const onArtistChange = (event) => {
    setArtist(event.target.value);
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
  };

  return (
    <div>
      <input
        onChange={onTitleChange}
        value={title}
        type="text"
        placeholder="title"
      />
      <input
        onChange={onArtistChange}
        value={artist}
        type="text"
        placeholder="artist"
      />
      <div>{emptyAlert}</div>
      <span
        className="material-icons-round md-light"
        id={styles.search}
        onClick={searchReq}
      >
        search
      </span>
      <button onClick={onSubmit}>Submit</button>
      <button onClick={deleteData}>Delete Something</button>
      {loading ? (
        <LoadingMotion />
      ) : (
        <div id={styles.bigContainer}>{searchResults}</div>
      )}
    </div>
  );
}

export default AddMusic;
