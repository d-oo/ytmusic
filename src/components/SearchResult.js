import styles from "./SearchResult.module.css";

function SearchResult({ info, id, setVideoResult, setVideoId, index }) {
  return (
    <div className={styles.searchResult}>
      <a
        href={`https://www.youtube.com/watch?v=${id}`}
        target="_blank"
        rel="noreferrer"
      >
        <img alt={index} src={info.thumbnails.medium.url} />
      </a>
      <div
        id={styles.title}
        onClick={() => {
          setVideoResult(
            <div id={styles.selected}>
              <SearchResult
                info={info}
                id={id}
                setVideoResult={setVideoResult}
                setVideoId={setVideoId}
                index={7}
              />
            </div>
          );
          setVideoId(id);
        }}
      >
        {info.title}
      </div>
      <div id={styles.channel}>{info.channelTitle}</div>
    </div>
  );
}

export default SearchResult;
