function AddMusic() {
  const str = "태연 rain";
  const searchRequest = async (event) => {
    setLoading("Loading...");
    const json = await (
      await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=4&type=video&q=${str}&key=AIzaSyB2FZm66fL_kpyY_qcaNqvFFmODsbVTrNY`
      )
    ).json();
    console.log(str.split(" ").join("+"));
    console.log(event);
    setLoading(json.items[0].snippet.title);
  };
  return (
    <div>
      {loading}
      <button onClick={searchRequest}>Search</button>
    </div>
  );
}

export default AddMusic;
