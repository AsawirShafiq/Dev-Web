import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotService } from '../services/chatbotService';
import { getToken } from '../utils/token';

export default function ChatPopup() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '👋 Hi! I\'m your shopping assistant. I can help you search products, manage your cart, and complete purchases. How can I help?'
        }
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !isAuthenticated) return;

    const userMessage = input.trim();
    setInput('');

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = getToken();
      const response = await chatbotService.sendMessage(userMessage, user.id, token);
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.answer }
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to get response. Please try again.';
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ ${errorMessage}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
        >
          <i className="bi bi-chat-dots-fill"></i>
        </button>
      )}

      {/* Chat Popup Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '380px',
            height: '550px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="bi bi-robot" style={{ fontSize: '1.5rem' }}></i>
              <div>
                <div style={{ fontWeight: 600 }}>Shopping Assistant</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Online</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              backgroundColor: '#f9fafb'
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '0.75rem'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: message.role === 'user' ? '#10b981' : 'white',
                    color: message.role === 'user' ? 'white' : '#1f2937',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    fontSize: '0.875rem'
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="spinner-border spinner-border-sm text-success" role="status"></div>
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '0.5rem', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('Show me products')}
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                🔍 Products
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('Show my cart')}
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                🛒 Cart
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('I want to buy now')}
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                💳 Buy
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderTop: '1px solid #e5e7eb'
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
