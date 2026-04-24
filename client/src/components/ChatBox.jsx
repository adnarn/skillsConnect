import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api';

export default function ChatBox({ bookingId, otherUserName, onClose, isMobile = false }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages
    fetchMessages();

    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);

    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/messages/${bookingId}`);
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const res = await api.post(`/chat/messages/${bookingId}`, {
        content: messageContent
      });

      setMessages((prev) => [...prev, res.data]);
      // Refresh messages to get latest state
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'fixed inset-0 z-50 flex flex-col' : 'p-4'}`}>
        {isMobile && (
          <div className="flex items-center gap-3 p-4 border-b">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="font-semibold">{otherUserName}</h3>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-gray-500 text-center">No messages yet. Say hello! 👋</p>
        </div>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              rows="1"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${isMobile ? 'fixed inset-0 z-50 flex flex-col' : 'p-4'}`}>
      {isMobile && (
        <div className="flex items-center gap-3 p-4 border-b">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold">{otherUserName}</h3>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${isMobile ? 'p-4' : 'max-h-96 overflow-y-auto mb-4'}`}>
        {messages.map((message) => {
          const isMyMessage = message.sender._id === localStorage.getItem('userId');
          return (
            <div
              key={message._id}
              className={`flex gap-3 mb-4 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
            >
              {!isMyMessage && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">
                    {getInitials(message.sender.name)}
                  </span>
                </div>
              )}
              <div className={`max-w-xs md:max-w-md ${isMyMessage ? 'order-2' : ''}`}>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isMyMessage
                      ? 'bg-[#1D9E75] text-white'
                      : 'bg-[#F3F4F6] text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-1 ${isMyMessage ? 'text-right' : ''}`}>
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={`p-4 border-t ${isMobile ? 'mt-auto' : ''}`}>
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            rows="1"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
