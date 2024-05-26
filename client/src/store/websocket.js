// src/store/websocket.js

import { addMessage, completeBotMessage, updateMessageId } from './chatSlice';

let socket = null;

export const setupWebSocket = (dispatch, chatId) => {
  // Close any existing WebSocket connection before opening a new one
  if (socket) {
    socket.close();
  }

  socket = new WebSocket(`ws://localhost:8004/ws/chat/${chatId}/`);

  socket.onmessage = (event) => {
    const messageData = JSON.parse(event.data);
  
    console.log('Received image URL from backend:', messageData.image_url);

  // Dispatch the addMessage action with the image URL if it exists
  dispatch(addMessage({
    id: messageData.temp_id,
    content: messageData.message,
    image_vision_upload: messageData.image_url,
    is_user: false,
    timestamp: new Date().toISOString()
  }));

    // Dispatch the updateMessageId action to update the message_id in the state
    dispatch(updateMessageId({ temp_id: messageData.temp_id, id: messageData.message_id }));
  
    // If the bot's response is complete, call completeBotMessage
    if (messageData.is_complete) {
      dispatch(completeBotMessage());
    }
  };

  socket.onclose = (event) => {
    console.log('WebSocket closed', event);
  };
}

export const sendMessage = (message, chatId, dispatch, imageBase64 = null) => {
  if (socket) {
    console.log('WebSocket message sent:', message);
    const temp_id = Date.now();
    dispatch(addMessage({ id: temp_id, content: message, is_user: true, timestamp: new Date().toISOString() }));
    
    let data = {
      'message': message,
      'temp_id': temp_id,
    };

    if (imageBase64) {
      data['image_base64'] = imageBase64;
    }

    socket.send(JSON.stringify(data));
  }
}

export const sendTerminateMessage = (chatId) => {
  if (socket) {
    console.log("Terminate message being sent to backend via websocket.js: 'socket.send(JSON.stringify({ 'type': 'terminate', 'chat_id': ", chatId )
    socket.send(JSON.stringify({
      'type': 'terminate',
      'chat_id': chatId
    }));
  }
}

export const closeWebSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    console.log('WebSocket connection closed');  // Log when the connection is closed
    socket.close();
  }
}