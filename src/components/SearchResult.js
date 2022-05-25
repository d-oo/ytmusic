//import styles from "./SearchResult.module.css"

function SearchResult({ info, id }) {
  return (
    <span>
      <img alt={id} src={info.thumbnails.medium.url} />
      <div>{info.title}</div>
      <div>{info.channelTitle}</div>
    </span>
  );
}

export default SearchResult;
