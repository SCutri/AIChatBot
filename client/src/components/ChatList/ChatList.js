// src/components/ChatList/ChatList.js

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChats } from '../../store/chatSlice';
import ChatListItem from './ChatListItem';
import ChatCreateButton from './ChatCreateButton';
import styles from './styles/ChatList.module.css';
import { useNavigate } from 'react-router-dom';

const ChatList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chats = useSelector(state => state.chat.chats);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleChatClick = (chat) => {
    navigate(`/chat/${chat.id}/`);
  };


  // create a sorted copy of chats
  const sortedChats = [...chats].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={styles.chatList}>
      <ChatCreateButton />
      {sortedChats.map(chat => <ChatListItem key={chat.id} chat={chat} onClick={() => handleChatClick(chat)} />)}
    </div>
  );
};

export default ChatList;