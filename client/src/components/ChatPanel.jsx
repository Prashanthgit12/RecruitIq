import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import api from '../api/axios';

const ChatPanel = ({ roomId, user, socket }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingUser, setTypingUser] = useState(null); // { userName, userRole } or null
  
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  // 1. Fetch Chat History on mount
  useEffect(() => {
    const fetchChatLogs = async () => {
      try {
        const interviewRes = await api.get(`/interviews/room/${roomId}`);
        const interview = interviewRes.data;

        const chatRes = await api.get(`/chat/${interview.id}`);
        setMessages(chatRes.data);
      } catch (err) {
        console.error('Error fetching chat history:', err);
      }
    };

    if (roomId) {
      fetchChatLogs();
    }
  }, [roomId]);

  // 2. Listen for socket chat events
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    socket.on('chat-message', (chatMsg) => {
      setMessages((prev) => [...prev, chatMsg]);
      // Reset typing indicator when message arrives
      setTypingUser(null);
    });

    // Listen for typing events
    socket.on('typing-start', ({ userName, userRole }) => {
      setTypingUser({ userName, userRole });
    });

    socket.on('typing-stop', () => {
      setTypingUser(null);
    });

    return () => {
      socket.off('chat-message');
      socket.off('typing-start');
      socket.off('typing-stop');
    };
  }, [socket]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  /**
   * Handle keypress / typing notifications
   */
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (!socket || !roomId || !user) return;

    // Send typing status
    socket.emit('typing-start', { roomId, userName: user.name, userRole: user.role });

    // Clear previous timer
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    // Set a timer to stop typing after 2 seconds of inactivity
    typingTimer.current = setTimeout(() => {
      socket.emit('typing-stop', { roomId });
    }, 2000);
  };

  /**
   * Send Message
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !roomId || !user) return;

    socket.emit('chat-message', {
      roomId,
      senderId: user.id,
      message: input,
      senderName: user.name,
      senderRole: user.role,
    });

    // Stop typing notification immediately
    socket.emit('typing-stop', { roomId });
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }

    setInput('');
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl flex flex-col h-full shadow-lg overflow-hidden max-h-[500px]">
      {/* Header */}
      <div className="bg-dark-950 px-4 py-3.5 border-b border-dark-850 flex items-center gap-2">
        <MessageSquare size={16} className="text-brand-400" />
        <h3 className="font-bold text-sm text-dark-300 uppercase tracking-wider">Live Chat Channel</h3>
      </div>

      {/* Messages List Area */}
      <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-3 min-h-[250px]">
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-dark-500 italic text-xs">
            <span>No messages. Say hello!</span>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div
                key={msg.id || idx}
                className={`flex flex-col max-w-[80%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Sender Tag */}
                {!isMe && (
                  <span className="text-[9px] font-extrabold text-dark-400 capitalize mb-1 block">
                    {msg.sender_name} ({msg.sender_role})
                  </span>
                )}
                
                {/* Bubble content */}
                <div className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words ${
                  isMe
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-dark-950 border border-dark-850 text-dark-200 rounded-tl-none'
                }`}>
                  {msg.message}
                </div>

                <span className="text-[8px] text-dark-500 mt-1 block">
                  {formatTime(msg.created_at || new Date())}
                </span>
              </div>
            );
          })
        )}

        {/* Typing Notification indicator */}
        {typingUser && (
          <div className="text-[10px] text-brand-400 italic font-medium animate-pulse self-start">
            💬 {typingUser.userName} ({typingUser.userRole}) is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSendMessage} className="bg-dark-950 p-3 border-t border-dark-850 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow bg-dark-900 border border-dark-800 rounded-xl px-4 py-2 text-white text-xs font-medium focus:outline-none focus:border-brand-500"
          placeholder="Send a message..."
        />
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-xl transition-all cursor-pointer shadow-md shadow-brand-500/10 shrink-0"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default ChatPanel;
