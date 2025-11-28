import { NextRequest, NextResponse } from "next/server";
import { createTTSClient, getAvatarVoices } from "@bandhubol/core";

export interface TTSRequest {
  text: string;
  avatarId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, avatarId } = body;

    // Validate inputs
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (!avatarId) {
      return NextResponse.json(
        { error: "Avatar ID is required" },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 }
      );
    }

    // Get avatar voices with environment variable overrides
    const avatarVoices = getAvatarVoices({
      ELEVENLABS_VOICE_RIYA: process.env.ELEVENLABS_VOICE_RIYA,
      ELEVENLABS_VOICE_ARJUN: process.env.ELEVENLABS_VOICE_ARJUN,
      ELEVENLABS_VOICE_MEERA: process.env.ELEVENLABS_VOICE_MEERA,
      ELEVENLABS_VOICE_KABIR: process.env.ELEVENLABS_VOICE_KABIR,
    });

    // Get voice ID for this avatar
    const voiceId = avatarVoices[avatarId] ?? avatarVoices.riya;

    // Create TTS client
    const tts = createTTSClient({ apiKey });

    // Generate speech with specific voice
    const audioBuffer = await tts.textToSpeech({
      text,
      voiceId,
    });

    // Return audio as response
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("TTS API error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: "Failed to generate speech", details: errorMessage },
      { status: 500 }
    );
  }
}

// Also support GET for simple testing
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get("text");
  const avatarId = searchParams.get("avatarId") ?? "riya";

  if (!text) {
    return NextResponse.json(
      { error: "Text query parameter is required" },
      { status: 400 }
    );
  }

  // Reuse POST logic
  const fakeRequest = {
    json: async () => ({ text, avatarId }),
  } as NextRequest;

  return POST(fakeRequest);
}
