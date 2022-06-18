import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../Home";

import styles from "./MusicInPlaylist.module.css";

export default function MusicInPlaylist({ info }) {
  return (
    <div id={styles.flexContainer}>
      <img
        alt={"musicInPlaylist" + index}
        src={`https://i.ytimg.com/vi/${info.videoId}/mqdefault.jpg`}
        width="128"
        height="72"
      />
      <div id={styles.titleDiv}>{info.title}</div>
      <div id={styles.artistDiv}>{info.artist.join(", ")}</div>
      <div id={styles.infoDiv}>
        <span
          className="material-icons-round"
          onClick={() => {
            navigate(`/music/${info.id}`);
          }}
        >
          info_outline
        </span>
      </div>
      <div id={styles.playDiv}>
        <span
          className="material-icons-round"
          onClick={() => {
            setPlayingVideoId(info.videoId);
            setPlayingMusicId(String(info.id));
            setVideoOn(true);
            setTitle(info.title);
          }}
        >
          play_arrow
        </span>
      </div>
      <div id={styles.addToDiv}>
        <span
          className="material-icons-round"
          onClick={() => {
            if (showResult) {
              return;
            }
            setShowResult(true);
          }}
        >
          playlist_add
        </span>
        <div id={styles.wrapper} ref={resultRef}>
          {showResult ? (
            <div id={styles.results}>
              {playlistResult.map((item, index) => (
                <div
                  key={index}
                  className={styles.result}
                  onClick={() => addToPlaylist(item)}
                >
                  {item.title}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
