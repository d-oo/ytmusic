import { useState } from "react";
import AddMusic from "./AddMusic";
import styles from "./SearchMusic.module.css";

export default function SearchMusic() {
  const [isAddMusicOn, setIsAddMusicOn] = useState(false);
  const AddMusicOn = () => setIsAddMusicOn(true);
  return (
    <div id={styles.bigContainer}>
      <br />
      <span
        className="material-icons-round"
        id={styles.addButton}
        onClick={AddMusicOn}
      >
        add
      </span>
      <div>asdf</div>
      <AddMusic
        from="SearchMusic"
        isAddMusicOn={isAddMusicOn}
        setIsAddMusicOn={setIsAddMusicOn}
      />
    </div>
  );
}
