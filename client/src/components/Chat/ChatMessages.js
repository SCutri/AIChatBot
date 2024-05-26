// src/components/Chat/ChatMessages.js
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editMessage } from '../../store/chatSlice';
import ChatCodeBlock from './ChatCodeBlock';
import styles from './styles/ChatMessages.module.css';

const Message = React.memo(({ message }) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(message.content);
  const activeChat = useSelector(state => state.chat.activeChat);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(message.content);
  }, [message.content]);

  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  
    // Wait for the next render cycle when the textarea is visible
    setTimeout(() => {
      const textarea = textareaRef.current;
      textarea.style.height = 'inherit'; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
    }, 0);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    const textarea = textareaRef.current;
    textarea.style.height = 'inherit'; // Reset height to recalculate
    textarea.style.height = `${textarea.scrollHeight}px`; // Set to scrollHeight
  };

  const handleSaveClick = async () => {
    await dispatch(editMessage({ chatId: activeChat, messageId: message.id, content }));
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setContent(message.content);
  };

  // Modify handleFormatting to return an array of React components and strings

  const handleFormatting = (text) => {
    if (message.is_user) {
      return [text];
    }
  
    // Adjusted regex to match asterisk lists
    const listWithAsterisksRegex = /(\*(\d+)?\s(.*?)(?::)?)([\s\S]*?)(?=\*\d|\*$|$)/gm;
  
    const parts = text.split(listWithAsterisksRegex).filter(Boolean);
  
    return parts.map((part, index) => {
      const match = listWithAsterisksRegex.exec(part);
      if (match) {
        // If it's an asterisk list item, return it as a list item element
        const title = match[3];
        const content = match[4].trim();
        return (
          <div key={index}>
            <strong>{title}</strong>
            <p>{content}</p>
          </div>
        );
      } else {
        // For non-list items, return the part as is
        return part;
      }
    });
  };

  // Function to extract all code blocks and the surrounding text
  const extractCodeBlocks = (text) => {
    if (message.is_user) {
      return [{ beforeCode: text, language: null, code: null, afterCode: '' }];
    }
    const codeRegex = /```(\w+)\n([\s\S]+?)```/g;
    let match;
    const blocks = [];
    let lastIndex = 0;

    while ((match = codeRegex.exec(text)) !== null) {
      const beforeCode = text.substring(lastIndex, match.index);
      lastIndex = codeRegex.lastIndex;
      blocks.push({
          beforeCode,
          language: match[1],
          code: match[2],
          afterCode: '', // Will be determined later
      });
  }

  // Add the remaining text after the last code block as afterCode to the last block
  if (blocks.length > 0) {
      blocks[blocks.length - 1].afterCode = text.substring(lastIndex);
  }

  // If no code blocks are found, return the original text as beforeCode
  if (blocks.length === 0) {
      blocks.push({ beforeCode: text, language: null, code: null, afterCode: '' });
  }

  return blocks;
  };

const codeBlocks = extractCodeBlocks(message.content);

return (
  <div className={styles[message.is_user ? 'user-message' : 'bot-message']}>
    <div className={styles.messageBackground}>
      <div className={styles['message-content']} style={{ whiteSpace: 'pre-wrap' }}>
        {isEditing ? (
          <div className={styles.editForm}>
            <textarea
              ref={textareaRef}
              className={styles.editTextarea}
              value={content}
              onChange={handleContentChange}
            />
            <div className={styles.buttonContainer}>
              <button onClick={handleSaveClick} className={styles.saveButton}>Save</button>
              <button onClick={handleCancelClick} className={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {codeBlocks.map((block, index) => (
              <React.Fragment key={index}>
                {block.beforeCode && (
                  <div>
                    {handleFormatting(block.beforeCode).map((formattedPart, partIndex) => (
                      <React.Fragment key={partIndex}>{formattedPart}</React.Fragment>
                    ))}
                  </div>
                )}
                {block.code && <ChatCodeBlock language={block.language} value={block.code} />}
                {block.afterCode && (
                  <div>
                    {handleFormatting(block.afterCode).map((formattedPart, partIndex) => (
                      <React.Fragment key={partIndex}>{formattedPart}</React.Fragment>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            {message.image_url && <img src={message.image_url} alt="Chat" className={styles.chatImage} />}
            {message.is_user && (
              <div className={styles.editButtonContainer}>
                <button onClick={handleEditClick} className={styles.editButton}>Edit</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);
});

const ChatMessages = () => {
  const messagesEndRef = useRef(null);
  const messages = useSelector(state => state.chat.messages);
  const currentBotMessage = useSelector(state => state.chat.currentBotMessage);

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentBotMessage]);

  return (
    <div className={styles['chat-messages']}>
      {messages.map((message, index) => (
        <Message key={message.id || index} message={message} />
      ))}
      {currentBotMessage && !messages.some(msg => msg.content === currentBotMessage.content) && (
        <div className={styles['bot-message']}>
          <div className={styles.messageBackground}>
            <div className={styles['message-content']} style={{ whiteSpace: 'pre-wrap' }}>
              {currentBotMessage.content}
            </div>
          </div>
          {currentBotMessage.image_url && <img src={currentBotMessage.image_url} alt="Chat" className={styles.chatImage} />}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;