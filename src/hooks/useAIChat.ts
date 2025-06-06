import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessageToAI } from '../api/ai';
import { Message } from '../types/chat';

export const useAIChat = (chatId: string) => {
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const response = await sendMessageToAI(message);
      return response;
    },
    onSuccess: (response) => {
      // Update the chat messages in the cache
      queryClient.setQueryData(['messages', chatId], (oldData: Message[] = []) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          content: response,
          sender: 'ai',
          timestamp: Date.now(),
          type: 'text',
          status: 'sent'
        };
        return [...oldData, newMessage];
      });
    },
    onError: (error) => {
      console.error('Error sending message to AI:', error);
      // Add error message to the chat
      queryClient.setQueryData(['messages', chatId], (oldData: Message[] = []) => {
        const errorMessage: Message = {
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: Date.now(),
          type: 'text',
          status: 'error'
        };
        return [...oldData, errorMessage];
      });
    }
  });

  return {
    sendMessage: sendMessage.mutate,
    isLoading: sendMessage.isPending,
    isError: sendMessage.isError,
    error: sendMessage.error
  };
}; 