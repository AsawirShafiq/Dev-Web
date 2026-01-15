import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatbotService } from '../services/chatbotService';
import { getToken } from '../utils/token';
import { useNavigate } from 'react-router-dom';

export default function Chatbot() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Add welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '👋 Hello! I\'m your shopping assistant. I can help you:\n\n• Search for products\n• Add items to your cart or wishlist\n• View your cart and wishlist\n• Complete your purchase\n\nHow can I help you today?'
        }
      ]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = getToken();
      const response = await chatbotService.sendMessage(userMessage, user.id, token);
      
      // Add assistant response
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.answer }
      ]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to get response. Please try again.';
      setError(errorMessage);
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

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Hello! I\'m your shopping assistant. How can I help you today?'
      }
    ]);
    setError(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingTop: '2rem', 
      paddingBottom: '2rem',
      backgroundColor: '#f9fafb'
    }}>
      <div className="container-lg" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">
            <i className="bi bi-chat-dots-fill me-2"></i>
            Shopping Assistant
          </h1>
          <button 
            onClick={clearChat}
            className="btn btn-outline-secondary"
            disabled={loading}
          >
            <i className="bi bi-trash me-1"></i>
            Clear Chat
          </button>
        </div>

        {/* Chat Container */}
        <div className="card" style={{ 
          height: '600px', 
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Messages Area */}
          <div 
            className="card-body" 
            style={{ 
              flex: 1, 
              overflowY: 'auto',
              padding: '1.5rem',
              backgroundColor: '#ffffff'
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`d-flex mb-3 ${message.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: message.role === 'user' ? '#10b981' : '#f3f4f6',
                    color: message.role === 'user' ? 'white' : '#1f2937',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: message.role === 'user' 
                      ? '0 2px 4px rgba(16, 185, 129, 0.2)'
                      : '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  {message.role === 'assistant' && (
                    <div style={{ marginBottom: '0.5rem', opacity: 0.7, fontSize: '0.875rem' }}>
                      <i className="bi bi-robot me-1"></i>
                      Assistant
                    </div>
                  )}
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="d-flex justify-content-start mb-3">
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '1rem',
                    backgroundColor: '#f3f4f6',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div 
            className="card-footer" 
            style={{ 
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              padding: '1rem'
            }}
          >
            {error && (
              <div className="alert alert-danger py-2 mb-2" role="alert">
                {error}
              </div>
            )}

            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Type your message... (e.g., 'Show me beverages' or 'Add product 123 to cart')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1rem'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="btn btn-success"
                style={{
                  minWidth: '100px',
                  borderRadius: '0.5rem'
                }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                    Sending
                  </>
                ) : (
                  <>
                    <i className="bi bi-send-fill me-1"></i>
                    Send
                  </>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="d-flex flex-wrap gap-2 mt-3">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('Show me products')}
                disabled={loading}
              >
                🔍 Search Products
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('Show my cart')}
                disabled={loading}
              >
                🛒 View Cart
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('Show my wishlist')}
                disabled={loading}
              >
                ❤️ View Wishlist
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setInput('I want to buy now')}
                disabled={loading}
              >
                💳 Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-3 text-center text-muted">
          <small>
            <i className="bi bi-info-circle me-1"></i>
            Tip: You can ask me to search products, manage your cart, or complete purchases!
          </small>
        </div>
      </div>
    </div>
  );
}
