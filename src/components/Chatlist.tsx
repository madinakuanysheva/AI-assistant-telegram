// src/components/ChatList.tsx
import React, { useState, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { Chat } from '../types/chat';

export const ChatList: React.FC = () => {
  const { state, dispatch } = useChat();
  const { theme } = useTheme();
  const [searchInput, setSearchInput] = useState('');

  const handleChatSelect = (chatId: string) => {
    dispatch({ type: 'SET_ACTIVE_CHAT', payload: chatId });
  };

  const filteredChats = useMemo(() => {
    const searchLower = searchInput.toLowerCase();
    return state.chats.filter(chat => 
      chat.name.toLowerCase().includes(searchLower) ||
      chat.lastMessage?.content.toLowerCase().includes(searchLower)
    );
  }, [state.chats, searchInput]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Telegram Clone</h1>
      </div>
      
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchInput}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
              state.activeChat === chat.id ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => handleChatSelect(chat.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl">
                  {chat.avatar || '👤'}
                </div>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-200 truncate">{chat.name}</h3>
                  {chat.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {chat.type === 'ai' && (
                    <span className="text-xs text-blue-500 dark:text-blue-400">AI</span>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors duration-200"
          onClick={() => {
            const newChat: Chat = {
              id: Date.now().toString(),
              name: 'New AI Chat',
              type: 'ai',
              unreadCount: 0,
              avatar: '🤖',
              category: 'ai-assistants'
            };
            const updatedChats = [...state.chats, newChat];
            dispatch({ type: 'SET_CHATS', payload: updatedChats });
            dispatch({ type: 'SET_ACTIVE_CHAT', payload: newChat.id });
          }}
        >
          New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatList;
