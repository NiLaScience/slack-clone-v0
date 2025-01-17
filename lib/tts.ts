const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

export async function getTTSAudio(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<ArrayBuffer> {
  if (!text) throw new Error("No text provided");
  if (!ELEVENLABS_API_KEY) throw new Error("Missing ElevenLabs API key");

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`TTS API error: ${response.statusText}`);
  }

  return response.arrayBuffer();
} 