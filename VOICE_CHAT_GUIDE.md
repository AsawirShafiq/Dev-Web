# Voice Chat Integration Guide

## Overview
The chatbot now supports voice interactions using OpenAI's voice models:
- **Whisper (Speech-to-Text)**: Converts voice input to text
- **TTS (Text-to-Speech)**: Converts responses to voice output
- **Function Calling**: All existing functions (search, cart, wishlist, purchase) work with voice

## Backend Implementation

### New Endpoints Added to `chatbot.py`

#### 1. Speech-to-Text (Transcribe)
```
POST /voice/transcribe
Content-Type: multipart/form-data

Parameters:
- audio: Audio file (WebM, MP3, WAV, etc.)

Response:
{
  "text": "transcribed text",
  "status": "success"
}
```

#### 2. Text-to-Speech (Synthesize)
```
POST /voice/synthesize?text=Hello&voice=alloy

Parameters:
- text: Text to convert to speech (query parameter)
- voice: Voice selection (alloy, echo, fable, onyx, nova, shimmer)

Response:
- Audio/MPEG file
```

#### 3. Complete Voice Chat Flow
```
POST /voice/chat
Content-Type: multipart/form-data

Parameters:
- audio: Audio file with user's voice message
- user_id: User ID for authentication
- access_token: JWT token
- voice: TTS voice preference (default: alloy)

Response:
- Audio/MPEG file with synthesized response
- Headers include:
  - X-Transcribed-Text: What the user said
  - X-Response-Text: The bot's text response
```

### How It Works

1. **User records voice** → Audio sent to `/voice/chat`
2. **Whisper transcribes** → Text extracted from audio
3. **GPT processes** → Uses function calling (search, cart, etc.)
4. **Functions execute** → Add to cart, search products, etc.
5. **Response generated** → GPT creates natural language response
6. **TTS synthesizes** → Text converted to speech
7. **Audio returned** → User hears the response

### Function Calling Support

All existing chatbot functions work with voice:
- ✅ `search_products` - Search for products by voice
- ✅ `add_to_cart` - "Add product 123 to my cart"
- ✅ `add_to_wishlist` - "Save product 456 to wishlist"
- ✅ `get_cart` - "What's in my cart?"
- ✅ `get_wishlist` - "Show my wishlist"
- ✅ `remove_from_cart` - "Remove product 789 from cart"
- ✅ `remove_from_wishlist` - "Delete product 321 from wishlist"
- ✅ `buy_products` - "I want to checkout now"

## Frontend Implementation

### Updated `chatbotService.js`

Added three new service methods:
```javascript
// Transcribe audio to text
transcribeAudio(audioBlob)

// Convert text to speech
synthesizeSpeech(text, voice)

// Complete voice chat flow
voiceChat(audioBlob, userId, accessToken, voice)
```

### Updated `Chatbot.jsx`

New features:
- 🎤 **Record button**: Click to start/stop recording
- 🔊 **Voice selector**: Choose from 6 different voices
- 📢 **Auto-playback**: Responses automatically play as audio
- 🎵 **Visual indicators**: Shows voice messages and audio responses
- ⏺️ **Recording indicator**: Live feedback while recording

### Voice Options

1. **Alloy** - Neutral, clear voice
2. **Echo** - Male, confident voice
3. **Fable** - British accent
4. **Onyx** - Deep, authoritative voice
5. **Nova** - Female, warm voice
6. **Shimmer** - Soft, gentle voice

## Usage Examples

### Example 1: Search Products by Voice
**User says**: "Show me all beverages"
**Bot transcribes**: "Show me all beverages"
**Bot searches** → Finds products
**Bot responds**: "Here are the products I found: Coca-Cola, Pepsi, Sprite..."
**User hears** → Synthesized speech with product list

### Example 2: Add to Cart by Voice
**User says**: "Add product 6793c31234567890 to my cart"
**Bot transcribes** → Processes command
**Bot calls** → `add_to_cart` function
**Bot responds**: "Successfully added Coca-Cola (€2.50) to your cart!"
**User hears** → Confirmation message

### Example 3: Complete Purchase by Voice
**User says**: "I want to buy everything in my cart"
**Bot transcribes** → Understands checkout intent
**Bot calls** → `buy_products` function
**Bot responds**: "Purchase successful! Your invoice ID is..."
**User hears** → Full order summary

## Testing

### Test Backend Endpoints

1. **Start the chatbot service**:
```bash
cd grocery_backend
python chatbot.py
```

2. **Test transcription** (requires audio file):
```bash
curl -X POST http://127.0.0.1:8001/voice/transcribe \
  -F "audio=@test_audio.webm"
```

3. **Test TTS**:
```bash
curl "http://127.0.0.1:8001/voice/synthesize?text=Hello%20World&voice=alloy" \
  --output response.mp3
```

4. **Test complete voice chat**:
```bash
curl -X POST http://127.0.0.1:8001/voice/chat \
  -F "audio=@test_audio.webm" \
  -F "user_id=USER_ID" \
  -F "access_token=YOUR_TOKEN" \
  -F "voice=alloy" \
  --output response.mp3
```

### Test Frontend

1. Start both backend services:
```bash
# Terminal 1: Main backend
cd grocery_backend
python run.py

# Terminal 2: Chatbot service
python chatbot.py
```

2. Start frontend:
```bash
cd grocery-frontend
npm run dev
```

3. Navigate to Chatbot page and:
   - Click microphone button
   - Say a command (e.g., "Show me products")
   - Click stop button
   - Listen to the audio response

## Browser Requirements

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: May require HTTPS for microphone access
- **Permissions**: User must grant microphone access

## Configuration

### Backend Configuration
- OpenAI API key must be set in `.env`
- Models used:
  - `whisper-1` for STT
  - `tts-1` for TTS
  - `gpt-4o-mini` for chat processing

### Frontend Configuration
- Chatbot API URL: `http://127.0.0.1:8001`
- Audio format: WebM (browser default)
- Response format: MP3

## Error Handling

### Common Issues

1. **Microphone access denied**
   - Error: "Could not access microphone"
   - Solution: Grant browser microphone permission

2. **Audio not playing**
   - Check browser audio settings
   - Verify audio element is not muted

3. **Transcription failed**
   - Verify OpenAI API key is valid
   - Check audio file format compatibility

4. **Function calling not working**
   - Ensure user_id and access_token are valid
   - Check backend logs for function execution errors

## Security Considerations

- ✅ JWT authentication required for all voice chat operations
- ✅ User ID validated before function execution
- ✅ Temporary audio files cleaned up after processing
- ✅ CORS configured for frontend access

## Future Enhancements

Potential improvements:
- Real-time streaming audio
- Voice activity detection
- Multi-language support
- Custom wake words
- Conversation history with audio playback
- Voice commands for navigation

## API Rate Limits

OpenAI API limits:
- Whisper: Max 25 MB audio file
- TTS: Max 4096 characters per request
- Rate limits apply based on your OpenAI plan

## Troubleshooting

### Debug Mode
Enable verbose logging by setting log level in chatbot.py:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Audio Format
Verify audio MIME type:
```javascript
console.log(audioBlob.type); // Should be 'audio/webm'
```

### Inspect Response Headers
Check transcribed text in browser DevTools → Network → Response Headers
