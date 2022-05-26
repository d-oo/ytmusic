import styles from "./SearchResult.module.css";

function SearchResult({ info, id }) {
  return (
    <span>
      <img alt={id} src={info.thumbnails.medium.url} />
      <div id={styles.title}>{info.title}</div>
      <div id={styles.channel}>{info.channelTitle}</div>
    </span>
  );
}

export default SearchResult;
