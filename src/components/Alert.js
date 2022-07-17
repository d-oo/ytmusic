import { useRef, useEffect, useContext, useMemo } from "react";
import { AppContext } from "../Home";

import styles from "./Alert.module.css";

export default function Alert({ message }) {
  const { showAlert, setShowAlert } = useContext(AppContext);
  const timeOut = useRef();
  useEffect(() => {
    if (showAlert) {
      timeOut.current = setTimeout(() => setShowAlert(false), 3000);
    }
  }, [showAlert, setShowAlert]);
  const sentence = useMemo(() => {
    switch (message) {
      case "addMusic":
        return "음악이 데이터베이스에 추가되었습니다.";
      case "updateMusic":
        return "음악 정보가 수정되었습니다.";
      case "deleteMusic":
        return "음악이 데이터베이스에서 삭제되었습니다.";
      case "addToPlaylist":
        return "음악이 재생목록에 추가되었습니다. (중복 곡 제외)";
      case "addToPlaylistSingle":
        return "음악이 재생목록에 추가되었습니다.";
      case "deleteFromPlaylist":
        return "음악이 재생목록에서 삭제되었습니다.";
      case "addPlaylist":
        return "재생목록이 추가되었습니다.";
      case "updatePlaylist":
        return "재생목록 정보가 수정되었습니다.";
      case "deletePlaylist":
        return "재생목록이 삭제되었습니다.";
      case "addMusicF":
        return "해당 비디오 ID를 사용하는 음악이 이미 존재합니다.";
      case "addPlaylistF":
        return "해당 제목의 재생목록이 이미 존재합니다.";
      case "updateMusicF":
        return "재생 중인 음악은 수정할 수 없습니다.";
      case "deleteMusicF":
        return "재생 중인 음악은 데이터베이스에서 삭제할 수 없습니다.";
      default:
        return `기타 오류: ${message}`;
    }
  }, [message]);
  return (
    <div
      id={styles.alert}
      className={showAlert ? styles.showing : styles.notShowing}
    >
      <span
        id={styles.closeButton}
        className="material-icons-round"
        onClick={() => {
          setShowAlert(false);
          clearTimeout(timeOut.current);
        }}
      >
        close
      </span>
      &nbsp;
      <div id={styles.sentence}>{sentence}</div>
    </div>
  );
}
