import { ChatState } from '../types/chat';

const STORAGE_KEY = 'chat_state';

export const saveChatState = (state: ChatState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving chat state:', error);
  }
};

export const loadChatState = (): ChatState | null => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : null;
  } catch (error) {
    console.error('Error loading chat state:', error);
    return null;
  }
}; 