// src/components/ChatList/ChatListItem.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateChatName, deleteChat } from '../../store/chatSlice';
import 'css.gg/icons/css/trash.css';
import styles from './styles/ChatListItem.module.css';

const ChatListItem = ({ chat, onClick }) => {
  const { chatId } = useParams();
  const isSelected = String(chat.id) === chatId;
  const itemClasses = [styles.chatListItem, isSelected ? styles.selected : ''].join(' ');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(chat.name);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    if (name !== chat.name) {
      await dispatch(updateChatName({ chatId: chat.id, name }));
    }
    setIsEditing(false);
  };

  const handleEditClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
    setName(chat.name || `Chat ${chat.id}`);
  };

  const handleOutsideClick = (event) => {
    if (event.target.tagName !== 'INPUT') {
      setIsEditing(false);
    }
  };

  const handleEscapePress = (event) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleDeleteClick = async (event) => {
    event.stopPropagation();
    await dispatch(deleteChat(chat.id));
    if (window.location.pathname === `/chat/${chat.id}`) {
      navigate('/');
    }
  };

  useEffect(() => {
    if (isEditing) {
      window.addEventListener('click', handleOutsideClick);
      window.addEventListener('keydown', handleEscapePress);
    } else {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleEscapePress);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleEscapePress);
    };
  }, [isEditing]);

  return (
    <div className={itemClasses} onClick={onClick}>
      {isEditing ? (
        <form onSubmit={handleNameSubmit}>
          <input type="text" value={name} onChange={handleNameChange} />
        </form>
      ) : (
        <>
          <button onClick={handleEditClick}>Edit</button>
          {chat.name || `Chat ${chat.id}`}
        </>
      )}
      <button className={`${styles.trashButton} gg-trash`} onClick={handleDeleteClick}></button>
    </div>
  );
};

export default ChatListItem;