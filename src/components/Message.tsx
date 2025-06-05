// src/components/Message.tsx
import React from 'react';
import { Message as MessageType } from '../types/chat';
import { useChat } from '../context/ChatContext';

interface MessageProps {
  message: MessageType;
  onReply?: (messageId: string) => void;
}

export const Message: React.FC<MessageProps> = ({ message, onReply }) => {
  const { state } = useChat();
  const isUser = message.sender === 'user';

  const renderReply = () => {
    if (!message.replyTo) return null;
    return (
      <div className="mb-1 text-sm text-gray-500 border-l-2 border-gray-300 pl-2">
        <p className="font-medium">
          {message.replyTo.sender === 'user' ? 'You' : 'AI Assistant'}
        </p>
        <p className="truncate">{message.replyTo.content}</p>
      </div>
    );
  };

  const renderStatus = () => {
    if (!isUser) return null;
    switch (message.status) {
      case 'sending':
        return <span className="text-gray-400">Sending...</span>;
      case 'sent':
        return <span className="text-gray-400">✓</span>;
      case 'delivered':
        return <span className="text-gray-400">✓✓</span>;
      case 'read':
        return <span className="text-blue-500">✓✓</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      onClick={() => onReply?.(message.id)}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        {renderReply()}
        <p className="text-gray-800">{message.content}</p>
        <div className="flex items-center justify-end mt-1 space-x-1">
          <span className="text-xs opacity-70">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default Message;
