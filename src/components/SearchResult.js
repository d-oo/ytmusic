import styles from "./SearchResult.module.css";

function SearchResult({ info, id, setVideoResult, setVideoId }) {
  return (
    <div className={styles.searchResult}>
      <img alt={id} src={info.thumbnails.medium.url} />
      <div
        id={styles.title}
        onClick={() => {
          setVideoResult(
            <div id={styles.selected}>
              <SearchResult
                info={info}
                id={"selected " + id}
                setVideoResult={setVideoResult}
                setVideoId={setVideoId}
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
