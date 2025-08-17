import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { ChatMessage, ClientArticle } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

export function useChat(articles: ClientArticle[]) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (question: string) => {
      return apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ question, articles }),
        headers: { 'Content-Type': 'application/json' }
      }) as Promise<ChatMessage>;
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, response]);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        question: inputValue,
        answer: "Sorry, I encountered an error. Please try again later.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const sendMessage = useCallback((message: string) => {
    if (!message.trim()) return;
    
    // Add user question to messages immediately
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      question: message,
      answer: '', // Will be filled by mutation
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, { ...userMessage, answer: '...' }]);
    setInputValue('');
    
    // Send to API
    chatMutation.mutate(message);
  }, [chatMutation]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    inputValue,
    setInputValue,
    sendMessage,
    clearChat,
    isLoading: chatMutation.isPending
  };
}