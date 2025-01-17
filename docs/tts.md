# ElevenLabs TTS Integration Checklist

## Stage 1: Basic TTS Implementation ⚡️

### Initial Setup
- [x] Add `ELEVENLABS_API_KEY` to `.env`
- [x] Create `lib/tts.ts` with core TTS functionality
  - Implementation: Basic `getTTSAudio()` function using ElevenLabs API
  - Returns: `ArrayBuffer` for immediate playback
  - Note: Start with single default voice for simplicity

### API Route
- [x] Create `/app/api/tts/route.ts`
  - Endpoint: POST with message text
  - Returns: Audio buffer with proper headers
  - Error handling: 400 for missing text, 500 for API issues

### Frontend Integration
- [x] Add play button to message component
  - UI: Use shadcn Button with PlayIcon
  - State: Add loading indicator during TTS generation
- [x] Implement audio playback logic
  - Use `URL.createObjectURL()` for blob creation
  - Clean up URLs after playback

### Optional Performance Optimizations
- [ ] Implement basic client-side caching
  - Key: `messageId + voiceId`
  - Storage: In-memory or localStorage
- [ ] Consider background pre-generation for latest N messages

## Stage 2: Voice Cloning 🎭

### Database Updates
- [ ] Update Prisma schema
```prisma
model User {
  voiceId String?
}

model Channel {
  voiceId String?
}
```

### Voice Sample Management
- [ ] Create voice sample upload UI
  - User profile: Personal voice upload
  - Channel settings: Channel-specific voice
- [ ] Implement S3 storage for samples
- [ ] Add ElevenLabs voice cloning integration
  - Store returned `voiceId` in database
  - Handle cloning API limits/quotas

### TTS Logic Updates
- [ ] Modify `getTTSAudio()` to support custom voices
- [ ] Implement voice selection logic:
  - User bot → User's voiceId
  - Channel bot → Channel's voiceId
  - Default → System voice

### Edge Cases & Error Handling
- [x] Implement fallbacks for missing voice samples
- [x] Handle voice cloning failures gracefully
- [ ] Add rate limiting for API calls
- [x] Manage concurrent voice cloning requests

## Testing & Validation 🧪
- [x] Test basic TTS with default voice
- [ ] Verify voice cloning process
- [x] Check audio playback in different browsers
- [x] Validate error handling
- [ ] Monitor API usage and limits

## Production Considerations 🚀
- [x] Set up proper error monitoring
- [ ] Implement usage tracking
- [ ] Add analytics for TTS usage
- [ ] Document API endpoints and usage

## Notes
- Start with Stage 1 for quick wins
- Voice cloning (Stage 2) requires additional ElevenLabs API quotas
- Consider implementing caching early if latency becomes an issue
- Monitor API usage to stay within limits 