'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatbotSettings } from '@/app/hooks/useChatbot';
import { LangGraphChatbot, ChatbotError } from '@/app/lib/langgraph-chatbot';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatbotContextType {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  settings: ChatbotSettings | null;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider');
  }
  return context;
};

interface ChatbotProviderProps {
  children: ReactNode;
  settings: ChatbotSettings | null;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children, settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize with welcome message when settings load
  React.useEffect(() => {
    if (settings?.isEnabled && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: settings.welcomeMessage,
          timestamp: new Date(),
        },
      ]);
    }
  }, [settings]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!settings || !content.trim() || !settings.apiKey) return;

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Prepare conversation history for LangGraph
        const history: BaseMessage[] = messages.map(msg => {
          if (msg.role === 'user') {
            return new HumanMessage(msg.content);
          } else if (msg.role === 'assistant') {
            return new AIMessage(msg.content);
          }
          throw new Error('Invalid message role in conversation history');
        });

        // Initialize LangGraph chatbot with API key from settings
        const chatbot = new LangGraphChatbot({
          apiKey: settings.apiKey,
          model: 'gemini-2.5-flash',
          temperature: 0.7,
          systemPrompt: settings.welcomeMessage,
        });

        // Get response from LangGraph
        const result = await chatbot.chat(content, history);

        if (result.error) {
          throw new Error(result.error);
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error('[Chatbot] Error:', error);
        let errorMessage = 'Sorry, I encountered an error. Please try again later.';
        
        if (error instanceof Error) {
          if (error.message.includes('API key')) {
            errorMessage = 'API key is missing or invalid. Please check your chatbot settings.';
          } else if (error.message.includes('rate limit') || error.message.includes('429')) {
            errorMessage = 'You are sending messages too quickly. Please wait a moment.';
          } else if (error.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          }
        }
        
        const errorChatMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [settings, messages]
  );

  const contextValue: ChatbotContextType = {
    isOpen,
    messages,
    isLoading,
    settings,
    toggleChat,
    openChat,
    closeChat,
    sendMessage,
    clearMessages,
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
};

