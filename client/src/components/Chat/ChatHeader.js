// src/components/Chat/ChatHeader.js
import React from 'react';
import styles from './styles/ChatHeader.module.css';

const ChatHeader = ({ toggleSystemMessagesModal, toggleInstructionsModal, toggleParametersModal }) => {
  return (
    <div className={styles.header}>
      <button className={styles.systemMessagesButton} onClick={toggleSystemMessagesModal}>System Messages</button>
      <button className={styles.parametersButton} onClick={toggleParametersModal}>Chat Parameters</button>
      <button className={styles.instructionsButton} onClick={toggleInstructionsModal}>Custom Instructions</button>
    </div>
  );
};

export default ChatHeader;