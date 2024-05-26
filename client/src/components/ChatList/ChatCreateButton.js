// src/components/ChatList/ChatCreateButton.js

import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createChat } from '../../store/chatSlice';
import styles from './styles/ChatCreateButton.module.css';

const ChatCreateButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = async () => {
    const newChat = await dispatch(createChat()).unwrap();
    navigate(`/chat/${newChat.id}/`);
  };

  return (
    <button className={styles.newChatButton} onClick={handleClick}>New Chat</button>
  );
};

export default ChatCreateButton;