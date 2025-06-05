import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Chat, Message, ChatState, ChatAction } from '../types/chat';
import { loadChatState, saveChatState } from '../utils/storage';

const initialState: ChatState = {
  chats: [],
  activeChat: null,
  messages: {},
  searchQuery: '',
  messageSearchQuery: '',
  isDarkMode: false,
  isTyping: false
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_CHATS':
      return { ...state, chats: action.payload };
    case 'SET_ACTIVE_CHAT':
      return { ...state, activeChat: action.payload };
    case 'SET_MESSAGE_SEARCH_QUERY':
      return { ...state, messageSearchQuery: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'ADD_MESSAGE':
      const updatedMessages = {
        ...state.messages,
        [action.payload.chatId]: [
          ...(state.messages[action.payload.chatId] || []),
          action.payload.message
        ]
      };
      return { ...state, messages: updatedMessages };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'UPDATE_MESSAGE_STATUS':
      const chatMessages = state.messages[action.payload.chatId] || [];
      const updatedChatMessages = chatMessages.map(msg =>
        msg.id === action.payload.messageId
          ? { ...msg, status: action.payload.status }
          : msg
      );
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: updatedChatMessages
        }
      };
    case 'REPLY_TO_MESSAGE':
      const messageToReply = state.messages[action.payload.chatId]?.find(
        msg => msg.id === action.payload.messageId
      );
      if (!messageToReply) return state;
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: state.messages[action.payload.chatId].map(msg =>
            msg.id === action.payload.messageId
              ? { ...msg, isReplying: true }
              : msg
          )
        }
      };
    default:
      return state;
  }
};

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
} | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  useEffect(() => {
    const savedState = loadChatState();
    if (savedState) {
      dispatch({ type: 'SET_CHATS', payload: savedState.chats });
      if (savedState.activeChat) {
        dispatch({ type: 'SET_ACTIVE_CHAT', payload: savedState.activeChat });
      }
      dispatch({ type: 'SET_MESSAGE_SEARCH_QUERY', payload: savedState.messageSearchQuery });
    }
  }, []);

  useEffect(() => {
    saveChatState(state);
  }, [state]);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 