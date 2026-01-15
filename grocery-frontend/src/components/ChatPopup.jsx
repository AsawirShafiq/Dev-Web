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

  // Voice chat states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const audioRef = useRef(null);

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

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        
        // Validate audio blob size
        if (audioBlob.size < 100) {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '❌ Recording too short. Please speak for at least 1 second.' 
          }]);
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '❌ Could not access microphone. Please grant permission in your browser settings.' 
      }]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    setLoading(true);

    try {
      const token = getToken();
      
      // Add a user message placeholder
      setMessages(prev => [...prev, { 
        role: 'user', 
        content: '🎤 Processing voice message...', 
        isVoice: true 
      }]);

      // Send voice to backend (STT -> Process -> TTS)
      const response = await chatbotService.voiceChat(
        audioBlob, 
        user.id, 
        token, 
        selectedVoice
      );

      // Get transcribed text and response text from headers (URL-encoded)
      const encodedTranscript = response.headers['x-transcribed-text'] || '';
      const encodedResponse = response.headers['x-response-text'] || '';
      
      // Decode URL-encoded strings
      const transcribedText = encodedTranscript ? decodeURIComponent(encodedTranscript) : 'Voice message';
      const responseText = encodedResponse ? decodeURIComponent(encodedResponse) : 'Response';

      // Update user message with transcribed text
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'user',
          content: `🎤 "${transcribedText}"`,
          isVoice: true
        };
        return newMessages;
      });

      // Add assistant response
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: responseText,
          hasAudio: true
        }
      ]);

      // Play audio response
      const audioUrl = URL.createObjectURL(response.data);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch(err => {
          console.warn('Could not auto-play audio:', err);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: '🔊 (Audio response received but autoplay blocked. Click to enable audio in your browser.)' }
          ]);
        });
      }

    } catch (err) {
      console.error('Voice chat error:', err);
      
      // More detailed error messages
      let errorMessage = 'Failed to process voice message.';
      
      if (err.response) {
        if (err.response.status === 500) {
          const detail = err.response.data?.detail || '';
          if (detail.includes('file format') || detail.includes('audio')) {
            errorMessage = 'Audio format not supported. Please try recording for longer (2-3 seconds).';
          } else if (detail.includes('OpenAI') || detail.includes('API')) {
            errorMessage = 'AI service error. Please try again.';
          } else {
            errorMessage = `Server error: ${detail.substring(0, 100)}`;
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else {
          errorMessage = err.response.data?.detail || 'Failed to process voice message.';
        }
      } else if (err.request) {
        errorMessage = 'Cannot connect to voice service. Is the chatbot service running?';
      }
      
      // Remove the processing message and add error
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // Remove processing message
        return [
          ...newMessages,
          { role: 'assistant', content: `❌ ${errorMessage}` }
        ];
      });
    } finally {
      setLoading(false);
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
            {/* Voice selector */}
            <div style={{ marginBottom: '0.5rem' }}>
              <select 
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  width: '120px'
                }}
              >
                <option value="alloy">🔊 Alloy</option>
                <option value="echo">🔊 Echo</option>
                <option value="fable">🔊 Fable</option>
                <option value="onyx">🔊 Onyx</option>
                <option value="nova">🔊 Nova</option>
                <option value="shimmer">🔊 Shimmer</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading || isRecording}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
              
              {/* Voice button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                style={{
                  backgroundColor: isRecording ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  width: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={isRecording ? 'Stop recording' : 'Start voice chat'}
              >
                {isRecording ? (
                  <i className="bi bi-stop-circle-fill"></i>
                ) : (
                  <i className="bi bi-mic-fill"></i>
                )}
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || isRecording}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  cursor: loading || !input.trim() || isRecording ? 'not-allowed' : 'pointer',
                  opacity: loading || !input.trim() || isRecording ? 0.5 : 1,
                  fontSize: '0.875rem'
                }}
              >
                <i className="bi bi-send-fill"></i>
              </button>
            </div>

            {/* Recording indicator */}
            {isRecording && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-record-circle-fill" style={{ animation: 'pulse 1.5s infinite' }}></i>
                <span>Recording... Speak clearly for 2-3 seconds, then click stop</span>
              </div>
            )}

            {/* Hidden audio element for playback */}
            <audio ref={audioRef} style={{ display: 'none' }} />
          </div>
        </div>
      )}
    </>
  );
}
