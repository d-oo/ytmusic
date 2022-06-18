import styles from "./VideoSearchResult.module.css";

export default function VideoSearchResult({ info, id, setVideoId, index }) {
  return (
    <div className={styles.searchResult}>
      <img
        alt={"videoSearchResult" + index}
        src={info.thumbnails.medium.url}
        onClick={() => setVideoId(id)}
      />
      <a
        href={`https://www.youtube.com/watch?v=${id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div id={styles.title}>{info.title}</div>
        <div id={styles.channel}>{info.channelTitle}</div>
      </a>
    </div>
  );
}
