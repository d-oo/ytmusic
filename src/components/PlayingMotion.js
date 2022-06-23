import styles from "./PlayingMotion.module.css";

export default function PlayingMotion({ isPaused }) {
  return (
    <div className={styles.waveform}>
      <div
        className={
          isPaused
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
      <div
        className={
          isPaused
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
      <div
        className={
          isPaused
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
      <div
        className={
          isPaused
            ? `${styles.waveform__bar} ${styles.pause}`
            : styles.waveform__bar
        }
      ></div>
    </div>
  );
}
