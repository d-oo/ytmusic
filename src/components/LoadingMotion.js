import styles from "./LoadingMotion.module.css";

export default function LoadingMotion() {
  return (
    <div className={styles.scalingdots}>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
      <div className={styles.waveform__bar}></div>
    </div>
  );
}
