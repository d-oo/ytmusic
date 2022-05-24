import { useState } from "react";

function AddMusic() {
  const [loading, setLoading] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [emptyAlert, setEmptyAlert] = useState("-");
  const [searchResults, setSearchResults] = useState("");
  //Youtube Data API - Search
  const searchReq = async (event) => {
    setLoading("Loading...");
    const str = title + " " + artist;
    console.log(str);
    const json = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&type=video&q=${str}&key=AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY`
      )
    ).json();
    console.log(event.target);
    setSearchResults(
      json.items.map((item, index) => (
        <div key={index}>SearchResult Component{item.snippet.title}</div>
      ))
    );
    setLoading("");
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
      {loading}
      <button onClick={searchReq}>Search</button>
      <form onSubmit={onSubmit}>
        <input
          onChange={onTitleChange}
          value={title}
          type="text"
          placeholder="title"
        />
        <div>-</div>
        <input
          onChange={onArtistChange}
          value={artist}
          type="text"
          placeholder="artist"
        />
        <div>{emptyAlert}</div>
        <button>Submit</button>
      </form>
      <button onClick={deleteData}>Delete Something</button>
      <div>Result: {searchResults}</div>
    </div>
  );
}

export default AddMusic;
