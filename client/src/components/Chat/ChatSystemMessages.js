// src/components/Chat/ChatSystemMessages.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSystemMessages } from '../../store/chatSlice';
import styles from './styles/ChatSystemMessages.module.css';

const ChatSystemMessages = ({ chatId, onClose }) => {
  const dispatch = useDispatch();
  const systemMessages1 = useSelector((state) => state.chat.systemMessages1);
  const systemMessages2 = useSelector((state) => state.chat.systemMessages2);
  const systemMessages3 = useSelector((state) => state.chat.systemMessages3);
  const systemMessages4 = useSelector((state) => state.chat.systemMessages4);
  const systemMessages5 = useSelector((state) => state.chat.systemMessages5);
  
  const [localSystemMessages, setLocalSystemMessages] = useState([
    systemMessages1,
    systemMessages2,
    systemMessages3,
    systemMessages4,
    systemMessages5,
  ]);
  
  useEffect(() => {
    setLocalSystemMessages([
      systemMessages1,
      systemMessages2,
      systemMessages3,
      systemMessages4,
      systemMessages5,
    ]);
  }, [systemMessages1, systemMessages2, systemMessages3, systemMessages4, systemMessages5]);

  const handleSystemMessageChange = (index) => (e) => {
    const newSystemMessages = [...localSystemMessages];
    newSystemMessages[index] = e.target.value;
    setLocalSystemMessages(newSystemMessages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateSystemMessages({ chatId, systemMessages: localSystemMessages }));
    onClose();
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>✕</button>
        <form className={styles.form} onSubmit={handleSubmit}>
          {localSystemMessages.map((message, index) => (
            <label key={index} className={styles.label}>
              System Message {index + 1}
              <textarea className={styles.input} value={message} onChange={handleSystemMessageChange(index)} />
            </label>
          ))}
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.sendButton}>Confirm</button>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatSystemMessages;