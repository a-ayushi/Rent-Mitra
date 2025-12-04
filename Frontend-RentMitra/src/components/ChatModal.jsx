import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8086';

const ChatModal = ({ open, onClose, chatId, currentUser, otherUser, product, startNewChat }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open || !chatId) return;
    const s = io(SOCKET_URL, { withCredentials: true });
    setSocket(s);
    s.emit('join-chat', chatId);
    s.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      s.disconnect();
    };
  }, [open, chatId]);

  useEffect(() => {
    if (open && chatId) {
      const token = localStorage.getItem('token');
      const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8086';
      axios.get(`${backendBase}/api/chats/${chatId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).then(res => setMessages(res.data));
    }
  }, [open, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (socket) {
      socket.emit('send-message', {
        chatId,
        senderId: currentUser._id || currentUser.id,
        content: input
      });
      setInput('');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="font-semibold">Chat with {otherUser?.name || 'User'}</div>
            {product && <div className="text-xs text-gray-500">Regarding: {product.name}</div>}
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: 350 }}>
          {messages.map((msg, idx) => (
            <div key={msg._id || idx} className={`mb-2 flex ${msg.sender === currentUser._id ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-3 py-2 rounded-lg ${msg.sender === currentUser._id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                {msg.content}
                <div className="text-xs text-gray-400 mt-1 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="flex items-center p-2 border-t">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1 mr-2"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
