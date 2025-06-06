import React from 'react';
import { ChatProvider } from './context/ChatContext';
import { ThemeProvider } from './context/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import ChatWindow from './components/ChatWindow';
import ChatList from './components/Chatlist';

function App() {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ChatProvider>
          <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <ChatList />
            <ChatWindow />
          </div>
        </ChatProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}

export default App;
