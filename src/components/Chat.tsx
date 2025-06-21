import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Chat.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const Chat = () => {
  const { logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI wellness companion. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'wellness'>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const callChatAPI = async (conversationHistory: Message[]): Promise<string> => {
    try {
      // Convert messages to API format, excluding the initial greeting
      const apiMessages: ApiMessage[] = conversationHistory
        .slice(1) // Skip the initial greeting message
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await fetch('https://mjagent-490766333568.us-central1.run.app/chat/completion', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || 'Sorry, I encountered an error processing your request.';
    } catch (error) {
      console.error('API call failed:', error);
      return 'Sorry, I\'m having trouble connecting right now. Please try again later.';
    }
  };

  const scrollToMessage = (messageElement: HTMLElement) => {
    if (chatContainerRef.current) {
      const messageTop = messageElement.offsetTop;
      
      chatContainerRef.current.scrollTo({
        top: messageTop - 10,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    requestAnimationFrame(() => {
      if (lastMessageRef.current) {
        scrollToMessage(lastMessageRef.current);
      }
    });

    try {
      const aiResponse = await callChatAPI(updatedMessages);
      
      const aiMessage: Message = {
        id: updatedMessages.length + 1,
        text: aiResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: updatedMessages.length + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'wellness' : 'dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className={`chat-container ${theme}`}>
      <div className="top-bar">
        <div className="logo">fit by evo</div>
        <button className="menu-button" onClick={toggleMenu}>☰</button>
      </div>
      
      <div className={`menu-backdrop ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)} />
      <div ref={menuRef} className={`menu-overlay ${isMenuOpen ? 'open' : ''}`}>
        <div className="menu-item" onClick={toggleTheme}>
          {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
        </div>
        <div className="menu-item" onClick={handleLogout}>
          🚪 Sign Out
        </div>
      </div>
      
      <div className="chat-content">
        <div className="messages-container" ref={chatContainerRef}>
          <div className="messages-inner">
            {messages.map((message, index) => (
              <div
                key={message.id}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={`message ${message.isUser ? 'user' : 'ai'}`}
              >
                {message.text}
              </div>
            ))}
            {isLoading && (
              <div className="message ai loading">
                <span className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              </div>
            )}
            <div className="scroll-padding" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask"
              className="message-input"
              disabled={isLoading}
            />
            <button type="submit" className="send-button" disabled={isLoading}>
              ↵
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 