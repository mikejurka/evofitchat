import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Chat.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const FAKE_REPLIES = [
  "I understand how you feel. Let's work on that together.",
  "That's a great question! Here's what I think...",
  "I'm here to support you on your wellness journey.",
  "Let me help you break that down into manageable steps.",
  "That's an interesting perspective. Have you considered...",
];

export const Chat = () => {
  const { logout } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI wellness companion. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
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

  const getRandomReply = () => {
    return FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
  };

  const scrollToMessage = (messageElement: HTMLElement) => {
    if (chatContainerRef.current) {
      const containerHeight = chatContainerRef.current.clientHeight;
      const messageTop = messageElement.offsetTop;
      
      chatContainerRef.current.scrollTo({
        top: messageTop - 10,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    requestAnimationFrame(() => {
      if (lastMessageRef.current) {
        scrollToMessage(lastMessageRef.current);
      }
    });

    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: getRandomReply(),
        isUser: false
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
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
            />
            <button type="submit" className="send-button">
              ↵
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 