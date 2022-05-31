import styles from "./PlayingMotion.module.css";

export default function PlayingMotion() {
  return (
    <div className={styles.waveform}>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
    </div>
  );
}
