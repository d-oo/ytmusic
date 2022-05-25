import styles from "./PlayingMotion.module.css";

function PlayingMotion() {
  return (
    <div className={styles.waveform}>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
    </div>
  );
}

export default PlayingMotion;
