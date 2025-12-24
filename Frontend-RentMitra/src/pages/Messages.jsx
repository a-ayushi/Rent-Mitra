import React, { useState, useRef } from 'react';
import { Send as SendIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/common/LoadingScreen';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setLoadingChats(true);
    const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8086';
    axios.get(`${backendBase}/api/chats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        setConversations(res.data);
        setLoadingChats(false);
        if (res.data.length > 0) setSelectedConversation(res.data[0]);
      })
      .catch(() => setLoadingChats(false));
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;
    const token = localStorage.getItem('token');
    setLoadingMessages(true);
    const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8086';
    axios.get(`${backendBase}/api/chats/${selectedConversation._id}/messages`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        setMessages(res.data);
        setLoadingMessages(false);
      })
      .catch(() => setLoadingMessages(false));
  }, [selectedConversation]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container px-4 py-12 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-gray-900">Messages</h1>
        <div className="bg-white rounded-2xl shadow-xl h-[70vh] flex">
          {/* Conversation List */}
          <div className="flex flex-col w-1/3 border-r border-gray-200">
            <div className="p-4 border-b">
              <div className="relative">
                <SearchIcon className="absolute top-2.5 left-3 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search conversations" className="w-full p-2 pl-10 border rounded-lg" />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {loadingChats ? (
                <div className="h-full p-4">
                  <LoadingScreen message="Loading conversations" minHeight="100%" size={18} />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-400">No conversations yet.</div>
              ) : (
                conversations.map(chat => {
                  // Use current user to distinguish self from other
                  const other = chat.participants.find(u => u._id !== (user?._id || user?.id));
                  return (
                    <div key={chat._id}
                      onClick={() => setSelectedConversation(chat)}
                      className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversation?._id === chat._id ? 'bg-gray-100' : ''}`}
                    >
                      <div className="flex justify-between">
                        <p className="font-semibold">{other?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{chat.updatedAt ? new Date(chat.updatedAt).toLocaleTimeString() : ''}</p>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{chat.lastMessage?.content || ''}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex flex-col w-2/3">
            <div className="flex items-center p-4 border-b">
              <h2 className="text-xl font-bold">{selectedConversation ? (selectedConversation.participants?.find(u => u._id !== (user?._id || user?.id))?.name || 'User') : ''}</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
              {loadingMessages ? (
                <div className="h-full">
                  <LoadingScreen message="Loading messages" minHeight="100%" size={18} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400">No messages yet.</div>
              ) : (
                <>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender === (user?._id || user?.id) || msg.sender?._id === (user?._id || user?.id);
                    return (
                      <div key={msg._id || i} className={`flex w-full mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-2 rounded-xl shadow text-sm whitespace-pre-line ${isMe ? 'bg-green-500 text-white rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none border'}`}>
                          {msg.content}
                          <div className="mt-1 text-xs text-right opacity-60">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <div className="p-4 border-t">
              <form className="relative" onSubmit={async (e) => {
                e.preventDefault();
                if (!input.trim() || !selectedConversation) return;
                const token = localStorage.getItem('token');
                const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8086';
                const chatId = selectedConversation?._id;
                if (!chatId) {
                  alert('Invalid chat selected.');
                  return;
                }
                const url = `${backendBase}/api/chats/${chatId}/message`;
                try {
                  const res = await axios.post(url, {
                    content: input,
                  }, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                  });
                  setMessages(prev => [...prev, res.data]);
                  setInput('');
                } catch (err) {
                  if (err.response && err.response.status === 404) {
                    alert('Chat not found or endpoint misconfigured.');
                  } else {
                    alert('Failed to send message');
                  }
                }
              }}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full p-3 pr-12 border rounded-lg"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={!selectedConversation}
                />
                <button type="submit" className="absolute top-2.5 right-2.5 bg-gray-800 text-white p-2 rounded-lg" disabled={!input.trim()}><SendIcon /></button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
