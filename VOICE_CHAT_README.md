# 🎙️ Voice Chat Feature

## Quick Start

### 1. Start the Services

```bash
# Terminal 1: Start main backend
cd grocery_backend
python run.py

# Terminal 2: Start chatbot service
python chatbot.py

# Terminal 3: Start frontend
cd grocery-frontend
npm run dev
```

### 2. Use Voice Chat

1. Navigate to the **Chatbot** page in your browser
2. Click the **microphone button** (🎤)
3. **Speak your command** (e.g., "Show me all beverages")
4. Click the **stop button** (⏹️)
5. **Listen to the response** - it plays automatically!

## Voice Commands You Can Use

### 🔍 Search Products
- "Show me all beverages"
- "Find me some snacks"
- "What dairy products do you have?"

### 🛒 Cart Operations
- "Add product [ID] to my cart"
- "Show me what's in my cart"
- "Remove product [ID] from my cart"

### ❤️ Wishlist Operations
- "Add product [ID] to my wishlist"
- "Show my wishlist"
- "Remove product [ID] from wishlist"

### 💳 Purchase
- "I want to buy now"
- "Checkout please"
- "Purchase everything in my cart"

## Choose Your Voice

Select from 6 different AI voices:
- **Alloy** - Neutral, balanced tone (default)
- **Echo** - Male, confident voice
- **Fable** - British accent
- **Onyx** - Deep, authoritative
- **Nova** - Female, warm tone
- **Shimmer** - Soft, gentle voice

## Technical Details

### Backend Endpoints
- `POST /voice/transcribe` - Convert speech to text
- `POST /voice/synthesize` - Convert text to speech
- `POST /voice/chat` - Complete voice chat flow

### Technologies Used
- **OpenAI Whisper** - Speech recognition
- **OpenAI TTS** - Text-to-speech synthesis
- **GPT-4o-mini** - Natural language understanding
- **MediaRecorder API** - Browser audio recording

## Testing

Run the test script:
```bash
python test_voice_chat.py
```

Or test endpoints directly:
```bash
# Test TTS
curl "http://127.0.0.1:8001/voice/synthesize?text=Hello%20World&voice=alloy" \
  --output response.mp3
```

## Requirements

- ✅ Microphone access (browser will request permission)
- ✅ Modern browser (Chrome, Firefox, Edge, Safari)
- ✅ Active internet connection
- ✅ Valid OpenAI API key in `.env`

## Troubleshooting

**Problem**: Microphone button doesn't work
- **Solution**: Grant microphone permission in browser settings

**Problem**: No audio plays
- **Solution**: Check browser volume and unmute tab

**Problem**: "Failed to process voice message"
- **Solution**: Ensure chatbot service is running on port 8001

## Complete Documentation

See [VOICE_CHAT_GUIDE.md](./VOICE_CHAT_GUIDE.md) for full technical documentation.

---

**Note**: Voice chat uses the same function calling system as text chat, so all features (search, cart, wishlist, purchase) work seamlessly with voice! 🎉
