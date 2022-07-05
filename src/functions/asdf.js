useEffect(() => {
  if (dbState === undefined || playingPlaylistId === "") {
    return;
  }
  const arr = [];
  const musicList =
    playlistResult[
      playlistResult.findIndex((i) => i.id === Number(playingPlaylistId))
    ].musicId;
  musicList.forEach((item, index) => {
    const musicInfoReq = db.current
      .transaction("music", "readonly")
      .objectStore("music")
      .get(item);
    musicInfoReq.onsuccess = () => {
      arr.push(musicInfoReq.result);
      if (index === musicList.length - 1) {
        setPlayingPlaylist(arr);
        //
        if (shuffle) {
          let len = arr.length,
            t,
            i;
          while (len) {
            i = Math.floor(Math.random() * len--);
            t = arr[len];
            arr[len] = arr[i];
            arr[i] = t;
          }
        }
        //
        setVideoOn(true);
      }
    };
  });
}, [dbState, playlistResult, playingPlaylistId, shuffle]);

useEffect(() => {
  if (dbState === undefined || playingMusicId === "") {
    return;
  }
  const transaction = db.current
    .transaction("music", "readwrite")
    .objectStore("music");
  const musicInfoReq = transaction.get(Number(playingMusicId));
  musicInfoReq.onsuccess = () => {
    const result = musicInfoReq.result;
    setTitle(result.title);
    setPlayingVideoId(result.videoId);
    setVideoOn(true);
    transaction.put({
      title: result.title,
      artist: result.artist,
      videoId: result.videoId,
      category: result.category,
      tag: result.tag,
      duration: result.duration,
      playCount: result.playCount + 1,
      recentPlay: Date.now(),
      id: result.id,
    });
  };
}, [dbState, playingMusicId]);

const playSingle = useCallback((musicId) => {
  setPlayingMusicId(musicId);
  setPlayingPlaylist([]);
  setPlayingPlaylistId("");
  setLoopPlaylist(false);
  setLoopMusic(false);
  setShuffle(false);
  setShuffleList([]);
}, []);

const playPlaylist = useCallback(
  (musicId, listId, isShuffle) => {
    if (playingPlaylistId !== listId) {
      setLoopPlaylist(false);
    }
    setPlayingPlaylistId(listId);
    setPlayingMusicId(musicId);
    setLoopMusic(false);
    if (!isShuffle) {
      setShuffle(false);
      setShuffleList([]);
    } else {
      setShuffle(true);
    }
  },
  [playingPlaylistId]
);

const playNext = useCallback(() => {
  let arr;
  setLoopMusic(false);
  if (shuffle) {
    arr = shuffleList;
  } else {
    arr = playingPlaylist;
  }
  const currentIndex = arr.findIndex((i) => i.id === Number(playingMusicId));
  if (currentIndex < arr.length - 1) {
    setPlayingMusicId(String(arr[currentIndex + 1].id));
  } else if (loopPlaylist) {
    setPlayingMusicId(String(arr[0].id));
  } else {
    setPlayingPlaylist([]);
    setPlayingPlaylistId("");
    setShuffle(false);
    setShuffleList([]);
  }
}, [playingPlaylist, playingMusicId, loopPlaylist, shuffle, shuffleList]);

const playPrevious = useCallback(() => {
  let arr;
  setLoopMusic(false);
  if (shuffle) {
    arr = shuffleList;
  } else {
    arr = playingPlaylist;
  }
  const currentIndex = arr.findIndex((i) => i.id === Number(playingMusicId));
  if (currentIndex > 0) {
    setPlayingMusicId(String(arr[currentIndex - 1].id));
  } else if (loopPlaylist) {
    setPlayingMusicId(String(arr[arr.length - 1].id));
  }
}, [playingPlaylist, playingMusicId, loopPlaylist, shuffle, shuffleList]);

const playShuffle = useCallback(
  (argPlaylistId) => {
    if (shuffle && argPlaylistId === playingPlaylistId) {
      setShuffle(false);
      setShuffleList([]);
    } else {
      const array = [...playingPlaylist];
      let len = array.length,
        t,
        i;
      while (len) {
        i = Math.floor(Math.random() * len--);
        t = array[len];
        array[len] = array[i];
        array[i] = t;
      }
      if (argPlaylistId !== playingPlaylistId) {
        setShuffle(true);
        playPlaylist(String(array[0]), argPlaylistId, true);
      } else {
        const currentIndex = array.findIndex(
          (i) => i.id === Number(playingMusicId)
        );
        t = array[currentIndex];
        array[currentIndex] = array[0];
        array[0] = t;
        setShuffle(true);
        setShuffleList(array);
      }
    }
  },
  [shuffle, playingPlaylistId, playingPlaylist, playingMusicId, playPlaylist]
);
