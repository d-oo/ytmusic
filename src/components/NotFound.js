import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div>
      <span
        className="material-icons-round"
        id={styles.backButton}
        onClick={() => navigate(-1)}
      >
        arrow_back
      </span>
      <p id={styles.notFound}>Not Found!</p>
    </div>
  );
}
