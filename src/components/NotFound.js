import { useNavigate, useLocation } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div id={styles.notFoundPage}>
      <div id={styles.smallWrapper}>
        <span
          className="material-icons-round"
          id={styles.backButton}
          onClick={() => navigate(-1)}
        >
          arrow_back
        </span>
        <p id={styles.notFound}>Not Found!</p>
        {location.pathname === "/wrongmusic"
          ? "Wrong Music ID"
          : location.pathname === "/wrongplaylist"
          ? "Wrong Playlist ID"
          : "Wrong Page"}
      </div>
    </div>
  );
}
