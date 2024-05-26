// src/App.js

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import store from './store/store';
import ParentContainer from './components/ParentContainer/ParentContainer';
import Chat from './components/Chat/Chat';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<ParentContainer />}>
            <Route path="chat/:chatId" element={<Chat />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;