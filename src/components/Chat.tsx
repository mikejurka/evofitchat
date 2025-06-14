import { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI wellness companion. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [theme, setTheme] = useState<'dark' | 'wellness'>('dark');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const getRandomReply = () => {
    return FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
  };

  const scrollToMessage = (messageElement: HTMLElement) => {
    if (chatContainerRef.current) {
      const containerHeight = chatContainerRef.current.clientHeight;
      const messageTop = messageElement.offsetTop;
      
      // Scroll so that the message is at the top of the container
      chatContainerRef.current.scrollTo({
        top: messageTop,
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

    // Scroll to the new message after it's rendered
    requestAnimationFrame(() => {
      if (lastMessageRef.current) {
        scrollToMessage(lastMessageRef.current);
      }
    });

    // Add AI reply after a short delay
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

  return (
    <div className={`chat-container ${theme}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
      
      <div className="messages-container" ref={chatContainerRef}>
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

      <form onSubmit={handleSubmit} className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
}; 