import { useMemo } from "react";
import styles from "./Alert.module.css";

export default function Alert({ message }) {
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
      case "otherError":
        return "기타 오류 발생 메시지 여기에 적어야 됨";
      default:
        return "etc";
    }
  }, [message]);
  return (
    <div id={styles.alert}>
      <span className="material-icons-round">close</span>
      <br />
      {sentence}
    </div>
  );
}
