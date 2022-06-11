import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Home";

export default function App() {
  if (!window.indexedDB) {
    window.alert("IndexedDB not available");
  }
  return (
    <Router>
      <Routes>
        <Route path="/other" element={<Home component="Other" />} />
        <Route path="/" element={<Home component="SearchMusic" />} />
      </Routes>
    </Router>
  );
}
