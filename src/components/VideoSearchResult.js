import styles from "./VideoSearchResult.module.css";

export default function VideoSearchResult({ info, id, setVideoId, index }) {
  return (
    <div className={styles.searchResult}>
      <img
        id={styles.thumbnail}
        alt={"videoSearchResult" + index}
        src={info.thumbnails.medium.url}
        onClick={() => setVideoId(id)}
      />
      <a
        href={`https://www.youtube.com/watch?v=${id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div id={styles.title} className={styles.pointerCursor}>
          {info.title.replace(/&#39;/g, "'")}
        </div>
        <div id={styles.channel} className={styles.pointerCursor}>
          {info.channelTitle}
        </div>
      </a>
    </div>
  );
}
