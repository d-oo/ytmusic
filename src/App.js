import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MusicInfo from "./components/MusicInfo";
import PlaylistInfo from "./components/PlaylistInfo";
import SearchMusic from "./components/SearchMusic";

import Home from "./Home";

export default function App() {
  if (!window.indexedDB) {
    window.alert("IndexedDB not available");
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<SearchMusic />} />
          <Route path="/music/:musicId" element={<MusicInfo />} />
          <Route path="/playlist/:playlistId" element={<PlaylistInfo />} />
        </Route>
        <Route path="*" element={<div>Not Found Component</div>} />
      </Routes>
    </Router>
  );
}
