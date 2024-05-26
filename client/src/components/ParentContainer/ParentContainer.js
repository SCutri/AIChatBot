// src/components/ParentContainer/ParentContainer.js

import React from 'react';
import { useParams } from 'react-router-dom';
import ChatList from '../ChatList/ChatList';
import Chat from '../Chat/Chat';
import styles from './ParentContainer.module.css';

const ParentContainer = () => {
  const { chatId } = useParams();

  return (
    <div className={styles.parentContainer}>
      <ChatList />
      <Chat chatId={chatId} />
    </div>
  );
};

export default ParentContainer;