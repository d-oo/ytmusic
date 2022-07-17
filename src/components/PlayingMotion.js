import { useContext } from "react";
import { AppContext } from "../Home";
import styles from "./PlayingMotion.module.css";

export default function PlayingMotion() {
  const { isPlaying } = useContext(AppContext);
  return (
    <div className={styles.waveform}>
      <div
        className={
          !isPlaying
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
      <div
        className={
          !isPlaying
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
      <div
        className={
          !isPlaying
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
      <div
        className={
          !isPlaying
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
    </div>
  );
}
