// src/components/Chat/Chat.js
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveChat } from '../../store/chatSlice';
import { setupWebSocket, closeWebSocket } from '../../store/websocket';
import { fetchChatMessages, fetchCustomInstructions, fetchChatParameters, fetchSystemMessages } from '../../store/chatSlice';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import CustomInstructions from './CustomInstructions';
import ChatParameters from './ChatParameters';
import ChatSystemMessages from './ChatSystemMessages';
import styles from './styles/Chat.module.css';

const Chat = ({ chatId }) => {
  const dispatch = useDispatch();
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const [isParametersModalOpen, setIsParametersModalOpen] = useState(false);
  const [isSystemMessagesModalOpen, setIsSystemMessagesModalOpen] = useState(false);

  const toggleInstructionsModal = () => {
    setIsInstructionsModalOpen(!isInstructionsModalOpen);
  };

  const toggleParametersModal = () => {
    setIsParametersModalOpen(!isParametersModalOpen);
  };

  const toggleSystemMessagesModal = () => {
    setIsSystemMessagesModalOpen(!isSystemMessagesModalOpen);
  };

  useEffect(() => {
    if (chatId) {
      dispatch(fetchChatMessages(chatId));
      dispatch(fetchCustomInstructions(chatId));
      dispatch(fetchChatParameters(chatId));
      dispatch(fetchSystemMessages(chatId));
    }
  }, [chatId, dispatch]);

  useEffect(() => {
    if (chatId) {
      dispatch(setActiveChat(chatId));
      setupWebSocket(dispatch, chatId);

      return () => {
        closeWebSocket();
      };
    }
  }, [dispatch, chatId]);

  if (!chatId) {
    return null;  // Don't render anything if chatId is undefined
  }

  return (
    <div className={styles.chat}>
      <ChatHeader toggleInstructionsModal={toggleInstructionsModal} toggleParametersModal={toggleParametersModal} toggleSystemMessagesModal={toggleSystemMessagesModal} />
      {isInstructionsModalOpen && <CustomInstructions chatId={chatId} onClose={toggleInstructionsModal} />}
      {isParametersModalOpen && <ChatParameters chatId={chatId} onClose={toggleParametersModal} />}
      {isSystemMessagesModalOpen && <ChatSystemMessages chatId={chatId} onClose={toggleSystemMessagesModal} />}
      <div className={styles.messagesContainer}>
        <div style={{ flex: 1 }}>
          <ChatMessages />
        </div>
      </div>
      <ChatInput />
    </div>
  );
};

export default Chat;