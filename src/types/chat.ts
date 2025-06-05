export interface Message {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'ai';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text';
  isReplying?: boolean;
  replyTo?: {
    id: string;
    content: string;
    sender: 'user' | 'ai';
  };
}

export interface Chat {
  id: string;
  name: string;
  type: 'user' | 'ai';
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
  isOnline?: boolean;
  category: 'people' | 'ai-assistants';
}

export interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  messages: { [chatId: string]: Message[] };
  searchQuery: string;
  messageSearchQuery: string;
  isDarkMode: boolean;
  isTyping: boolean;
}

export type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'SET_ACTIVE_CHAT'; payload: string }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_MESSAGE_SEARCH_QUERY'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { chatId: string; messageId: string; status: Message['status'] } }
  | { type: 'REPLY_TO_MESSAGE'; payload: { chatId: string; messageId: string } }; 