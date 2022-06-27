import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

import { useState, useEffect } from "react";

export default function NotFound() {
  const [tmp, setTmp] = useState("");
  const [arr, setArr] = useState([]);
  useEffect(() => {
    console.log(tmp);
    setArr([]);
    setArr((prev) => [...prev, tmp]);
  }, [tmp]);
  const navigate = useNavigate();
  return (
    <div>
      <span
        className="material-icons-round"
        id={styles.backButton}
        onClick={() => navigate(-1)}
      >
        arrow_back
      </span>
      <p id={styles.notFound}>Not Found!</p>
      input and recommend test
      <div style={{ color: "white" }}>
        <input
          type="text"
          value={tmp}
          onChange={(event) => {
            setTmp(event.target.value);
          }}
          onKeyUp={() => {
            // console.log("keyup");
            // console.log(tmp);
          }}
        />
        <br />
        {tmp}
        <br />
        {arr.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
}
