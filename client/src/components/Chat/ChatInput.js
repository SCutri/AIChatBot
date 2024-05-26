// src/components/Chat/ChatInput.js

import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage as sendWebSocketMessage } from '../../store/websocket';
import { clearCurrentBotMessage, terminateTask } from '../../store/chatSlice';
import styles from './styles/ChatInput.module.css';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const dispatch = useDispatch();
  const activeChat = useSelector(state => state.chat.activeChat);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTerminate = () => {
    dispatch(terminateTask(activeChat));
    dispatch(clearCurrentBotMessage());
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.trim() !== '' || image) {
      let imageBase64 = null;
      if (image) {
        imageBase64 = await convertImageToBase64(image);
        const formData = new FormData();
        formData.append('image', image);
        await fetch(`http://localhost:8083/chat/${activeChat}/upload_image/`, {
          method: 'POST',
          body: formData,
        });
      }
      sendWebSocketMessage(message, activeChat, dispatch, imageBase64);
      setMessage('');
      setImage(null);
      textareaRef.current.style.height = '40px';
      fileInputRef.current.value = null;
    }
  };
  
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    const textarea = textareaRef.current;
    textarea.style.height = 'inherit'; // Reset height to recalculate
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${scrollHeight}px`; // Set to scrollHeight
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.messageInputField}>
        <button type="button" onClick={handleTerminate} className={styles.terminateButton}>Stop</button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.input}
          placeholder="Type a message..."
        />
        <button type="submit" className={styles.sendButton}>Send</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className={styles.imageInput}
        />
      </form>
    </div>
  );
};

export default ChatInput;