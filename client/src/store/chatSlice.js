// src/store/chatSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendTerminateMessage } from './websocket';

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const response = await fetch('http://localhost:8083/chat/');
  const data = await response.json();
  data.forEach(chat => {
    chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  });
  return data;
});

export const createChat = createAsyncThunk('chat/createChat', async () => {
  const response = await fetch('http://localhost:8083/chat/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_info: '',
      response_info: '',
    }),
  });
  const data = await response.json();
  return data;
});

export const updateChatName = createAsyncThunk('chat/updateChatName', async ({ chatId, name }) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/update_name/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  const data = await response.json();
  return data;
});

export const deleteChat = createAsyncThunk(
  'chat/deleteChat',
  async (chatId) => {
    const response = await fetch(`http://localhost:8083/chat/${chatId}/delete/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
    return chatId;
  }
);

export const fetchChatMessages = createAsyncThunk('chat/fetchChatMessages', async (chatId) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/`);
  const data = await response.json();
  data.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  return data.messages.map(message => ({  // Map over the messages to handle the image field
    ...message,
    image_url: message.image || null,  // Use the image field from the server response
  }));
});

export const sendMessage = createAsyncThunk('chat/sendMessage', async ({ chatId, content }) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/send/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });
  const data = await response.json();
  return { ...data, is_user: true, timestamp: new Date().toISOString() };
});

export const editMessage = createAsyncThunk('chat/editMessage', async ({ chatId, messageId, content }) => {
  await fetch(`http://localhost:8083/chat/${chatId}/edit/${messageId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content, is_user: true }),
  });

  return { messageId, content };
});

export const fetchCustomInstructions = createAsyncThunk('chat/fetchCustomInstructions', async (chatId) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/`);
  const data = await response.json();
  return { projectInfo: data.project_info, responseInfo: data.response_info };
});

export const updateCustomInstructions = createAsyncThunk('chat/updateCustomInstructions', async ({ chatId, projectInfo, responseInfo }) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/update_info/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_info: projectInfo, response_info: responseInfo }),
  });
  const data = await response.json();
  return { projectInfo: data.project_info, responseInfo: data.response_info };
});

export const fetchChatParameters = createAsyncThunk('chat/fetchChatParameters', async (chatId) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/`);
  const data = await response.json();
  return { 
    model: data.model, 
    tokenLimit: data.token_limit, 
    temperature: data.temperature, 
    topP: data.top_p, 
    frequencyPenalty: data.frequency_penalty 
  };
});

export const updateChatParameters = createAsyncThunk('chat/updateChatParameters', async ({ chatId, model, tokenLimit, temperature, topP, frequencyPenalty }) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/update_parameters/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      model: model, 
      token_limit: tokenLimit, 
      temperature: temperature, 
      top_p: topP, 
      frequency_penalty: frequencyPenalty 
    }),
  });
  const data = await response.json();
  return { 
    model: data.model, 
    tokenLimit: data.token_limit, 
    temperature: data.temperature, 
    topP: data.top_p, 
    frequencyPenalty: data.frequency_penalty 
  };
});

export const fetchSystemMessages = createAsyncThunk('chat/fetchSystemMessages', async (chatId) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/`);
  const data = await response.json();
  return { 
    systemMessages1: data.system_messages_1, 
    systemMessages2: data.system_messages_2, 
    systemMessages3: data.system_messages_3, 
    systemMessages4: data.system_messages_4, 
    systemMessages5: data.system_messages_5
  };
});

export const updateSystemMessages = createAsyncThunk('chat/updateSystemMessages', async ({ chatId, systemMessages }) => {
  const response = await fetch(`http://localhost:8083/chat/${chatId}/update_system_messages/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      system_messages_1: systemMessages[0], 
      system_messages_2: systemMessages[1], 
      system_messages_3: systemMessages[2], 
      system_messages_4: systemMessages[3], 
      system_messages_5: systemMessages[4]
    }),
  });
  const data = await response.json();
  return { 
    systemMessages1: data.system_messages_1, 
    systemMessages2: data.system_messages_2, 
    systemMessages3: data.system_messages_3, 
    systemMessages4: data.system_messages_4, 
    systemMessages5: data.system_messages_5
  };
});

export const terminateTask = createAsyncThunk('chat/terminateTask', async (chatId, { dispatch }) => {
  sendTerminateMessage(chatId);
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    messages: [],
    currentBotMessage: null,
    projectInfo: '',
    responseInfo: '',
    model: null,
    tokenLimit: null,
    temperature: null,
    topP: null,
    frequencyPenalty: null,
    systemMessages1: null,
    systemMessages2: null,
    systemMessages3: null,
    systemMessages4: null,
    systemMessages5: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      const newMessage = {
        ...action.payload,
        image_url: action.payload.image_url || null,
      };
    
      if (action.payload.is_user) {
        state.messages.push(newMessage);
      } else {
        if (state.currentBotMessage) {
          // appending message to currentBotMessage might cause order problems
          state.currentBotMessage.content += action.payload.content;
          state.currentBotMessage.image_url = action.payload.image_url || state.currentBotMessage.image_url;
        } else {
          state.currentBotMessage = newMessage;
        }
      }
    },
    updateMessageId: (state, action) => {
      const { temp_id, id } = action.payload;
      const message = state.messages.find(message => message.id === temp_id);
      if (message) {
        message.id = id;
      } else {
        //console.log(`Message with temp_id ${temp_id} not found in state`);
      }
    },
    completeBotMessage: (state) => {
      if (state.currentBotMessage) {
        state.messages.push(state.currentBotMessage);
        state.currentBotMessage = null;
  
        // Refresh the page after the bot's response is complete
        window.location.reload();
      }
    },
    clearCurrentBotMessage: (state) => {
      state.currentBotMessage = null;
    },
    editMessageInState: (state, action) => {
      const { messageId, newMessage } = action.payload;
      const index = state.messages.findIndex(message => message.id === messageId);
      if (index !== -1) {
        state.messages = state.messages.slice(0, index);
        state.messages.push(newMessage);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.push(action.payload);
      })
      .addCase(updateChatName.fulfilled, (state, action) => {
        const chatIndex = state.chats.findIndex(chat => chat.id === action.payload.id);
        if (chatIndex !== -1) {
          state.chats[chatIndex] = action.payload;
        }
      })
      .addCase(deleteChat.fulfilled, (state, action) => {
        const chatIndex = state.chats.findIndex((chat) => chat.id === action.payload);
        state.chats.splice(chatIndex, 1);
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.currentBotMessage = null; // Reset currentBotMessage after fetching
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(editMessage.pending, (state, action) => {
        const { messageId, content } = action.meta.arg;
        const index = state.messages.findIndex(message => message.id === messageId);
        if (index !== -1) {
          state.messages[index].content = content;
          state.messages[index].timestamp = new Date().toISOString();
        }
      })
      .addCase(editMessage.fulfilled, (state, action) => {
        const { messageId, content } = action.payload;
        const messageIndex = state.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[messageIndex].content = content;
          state.messages = state.messages.slice(0, messageIndex + 1);
          state.currentBotMessage = null;
        }
      })
      .addCase(fetchCustomInstructions.fulfilled, (state, action) => {
        state.projectInfo = action.payload.projectInfo;
        state.responseInfo = action.payload.responseInfo;
      })
      .addCase(updateCustomInstructions.fulfilled, (state, action) => {
        state.projectInfo = action.payload.projectInfo;
        state.responseInfo = action.payload.responseInfo;
      })
      .addCase(fetchChatParameters.fulfilled, (state, action) => {
        state.model = action.payload.model;
        state.tokenLimit = action.payload.tokenLimit;
        state.temperature = action.payload.temperature;
        state.topP = action.payload.topP;
        state.frequencyPenalty = action.payload.frequencyPenalty;
      })
      .addCase(updateChatParameters.fulfilled, (state, action) => {
        state.model = action.payload.model;
        state.tokenLimit = action.payload.tokenLimit;
        state.temperature = action.payload.temperature;
        state.topP = action.payload.topP;
        state.frequencyPenalty = action.payload.frequencyPenalty;
      })
      .addCase(fetchSystemMessages.fulfilled, (state, action) => {
        state.systemMessages1 = action.payload.systemMessages1;
        state.systemMessages2 = action.payload.systemMessages2;
        state.systemMessages3 = action.payload.systemMessages3;
        state.systemMessages4 = action.payload.systemMessages4;
        state.systemMessages5 = action.payload.systemMessages5;
      })
      .addCase(updateSystemMessages.fulfilled, (state, action) => {
        state.systemMessages1 = action.payload.systemMessages1;
        state.systemMessages2 = action.payload.systemMessages2;
        state.systemMessages3 = action.payload.systemMessages3;
        state.systemMessages4 = action.payload.systemMessages4;
        state.systemMessages5 = action.payload.systemMessages5;
      })
  },
});

export const { setActiveChat, setMessages, addMessage, completeBotMessage, clearCurrentBotMessage, editMessageInState, updateMessageId } = chatSlice.actions;

export default chatSlice.reducer;