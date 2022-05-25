import styles from "./LoadingMotion.module.css";

function LoadingMotion() {
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

export default LoadingMotion;
