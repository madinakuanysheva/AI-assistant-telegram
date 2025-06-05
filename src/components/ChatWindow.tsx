import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ThemeContext';
import { Message as MessageType } from '../types/chat';
import { Message } from './Message';
import { sendMessageToAI } from '../api/ai';
import { FileUpload } from './FileUpload';

export const ChatWindow: React.FC = () => {
  const { state, dispatch } = useChat();
  const { theme } = useTheme();
  const [inputMessage, setInputMessage] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = state.chats.find(chat => chat.id === state.activeChat);
  const messages = state.messages[state.activeChat || ''] || [];

  const filteredMessages = useMemo(() => {
    if (!messageSearch.trim()) return messages;
    
    const searchLower = messageSearch.toLowerCase();
    return messages.filter((message: MessageType) => 
      message.content.toLowerCase().includes(searchLower)
    );
  }, [messages, messageSearch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !state.activeChat) return;

    const message: MessageType = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: Date.now(),
      type: 'text',
      status: 'sending',
      replyTo: replyingTo ? messages.find((m: MessageType) => m.id === replyingTo) : undefined
    };

    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.activeChat, message } });
    setInputMessage('');
    setReplyingTo(null);

    // Update message status to sent
    setTimeout(() => {
      dispatch({
        type: 'UPDATE_MESSAGE_STATUS',
        payload: { chatId: state.activeChat!, messageId: message.id, status: 'sent' }
      });
    }, 1000);

    // Get AI response if it's an AI chat
    if (activeChat?.type === 'ai') {
      setIsTyping(true);
      try {
        const response = await sendMessageToAI(inputMessage);
        const aiMessage: MessageType = {
          id: Date.now().toString(),
          content: response,
          sender: 'ai',
          timestamp: Date.now(),
          type: 'text',
          status: 'sent'
        };
        dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.activeChat, message: aiMessage } });
      } catch (error) {
        console.error('Error getting AI response:', error);
        const errorMessage: MessageType = {
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: Date.now(),
          type: 'text',
          status: 'sent'
        };
        dispatch({ type: 'ADD_MESSAGE', payload: { chatId: state.activeChat, message: errorMessage } });
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg">
            {activeChat.avatar || '👤'}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{activeChat.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {activeChat.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
        >
          <svg
            className="w-6 h-6 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>

      {/* Message Search */}
      {showSearch && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="relative">
            <input
              type="text"
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              placeholder="Search in messages..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
        {filteredMessages.map((message: MessageType) => (
          <Message key={message.id} message={message} onReply={handleReply} />
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce delay-200" />
            <span>AI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Replying to: {messages.find((m: MessageType) => m.id === replyingTo)?.content}
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="h-20 border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-2">
          <FileUpload
            onFileSelect={(file) => {
              // Handle file upload
              console.log('File selected:', file);
            }}
            onEmojiSelect={(emoji) => {
              setInputMessage(prev => prev + emoji);
            }}
            onVoiceMessage={(audioBlob) => {
              // Handle voice message
              console.log('Voice message:', audioBlob);
            }}
            onGifSelect={(gifUrl) => {
              // Handle GIF selection
              console.log('GIF selected:', gifUrl);
            }}
            onLocationShare={(location) => {
              // Handle location sharing
              console.log('Location shared:', location);
            }}
            disabled={isTyping}
          />
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 dark:bg-gray-700 dark:text-white"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className={`rounded-full p-2 transition-colors duration-200 ${
              inputMessage.trim() && !isTyping
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
