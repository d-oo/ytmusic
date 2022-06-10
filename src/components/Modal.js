import { useState, useEffect } from "react";
import styles from "./Modal.module.css";

export default function Modal({ children, setHandleFunction }) {
  const [showModal, setShowModal] = useState(false);
  const [showAni, setShowAni] = useState(false);

  useEffect(() => {
    console.log("A");
    const handleShowModal = (isOpen) => {
      if (isOpen) {
        setShowModal(true);
        setTimeout(() => setShowAni(true), 0);
      } else {
        setShowAni(false);
        setTimeout(() => setShowModal(false), 500);
      }
    };
    setHandleFunction(() => handleShowModal);
  }, [setHandleFunction, showAni]);
  return (
    <div id={styles.container}>
      {showModal ? (
        <div className={showAni ? styles.open : styles.close} id={styles.modal}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
