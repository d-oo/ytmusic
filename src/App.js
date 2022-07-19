import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MusicInfo from "./components/MusicInfo";
import PlaylistInfo from "./components/PlaylistInfo";
import SearchMusic from "./components/SearchMusic";
import NotFound from "./components/NotFound";

import Home from "./Home";

export default function App() {
  if (!window.indexedDB) {
    window.alert("IndexedDB not available");
  }
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route path="/" element={<SearchMusic />} />
          <Route path="/music/:musicId" element={<MusicInfo />} />
          <Route path="/playlist/:playlistId" element={<PlaylistInfo />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}
