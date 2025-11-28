import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export interface ElevenLabsConfig {
  apiKey: string;
}

export interface TextToSpeechOptions {
  text: string;
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}

// Default Voice IDs for BandhuBol avatars (ElevenLabs defaults)
// These can be overridden via environment variables
export const DEFAULT_AVATAR_VOICES: Record<string, string> = {
  // Female voices for Riya and Meera
  riya: "21m00Tcm4TlvDq8ikWAM", // Rachel - warm, empathetic
  meera: "EXAVITQu4vr4xnSDxMaL", // Bella - friendly, playful
  // Male voices for Arjun and Kabir  
  arjun: "ErXwobaYiN019PkySvjV", // Antoni - calm, grounded
  kabir: "VR6AewLTigWG4xSOukaG", // Arnold - direct, thoughtful
};

// Function to get avatar voices with environment variable overrides
export function getAvatarVoices(env?: Record<string, string | undefined>): Record<string, string> {
  return {
    riya: env?.ELEVENLABS_VOICE_RIYA ?? DEFAULT_AVATAR_VOICES.riya,
    arjun: env?.ELEVENLABS_VOICE_ARJUN ?? DEFAULT_AVATAR_VOICES.arjun,
    meera: env?.ELEVENLABS_VOICE_MEERA ?? DEFAULT_AVATAR_VOICES.meera,
    kabir: env?.ELEVENLABS_VOICE_KABIR ?? DEFAULT_AVATAR_VOICES.kabir,
  };
}

// For backwards compatibility
export const AVATAR_VOICES = DEFAULT_AVATAR_VOICES;

// Multilingual model for Hindi/Hinglish support
const DEFAULT_MODEL = "eleven_multilingual_v2";

export class BandhuBolTTSClient {
  private client: ElevenLabsClient;

  constructor(config: ElevenLabsConfig) {
    this.client = new ElevenLabsClient({
      apiKey: config.apiKey,
    });
  }

  /**
   * Convert text to speech and return audio as a Buffer
   */
  async textToSpeech(options: TextToSpeechOptions): Promise<Buffer> {
    const {
      text,
      voiceId,
      modelId = DEFAULT_MODEL,
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0.5,
    } = options;

    const audioStream = await this.client.textToSpeech.convert(voiceId, {
      text,
      modelId: modelId,
      voiceSettings: {
        stability,
        similarityBoost: similarityBoost,
        style,
        useSpeakerBoost: true,
      },
    });

    // Convert the stream to a buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }

  /**
   * Convert text to speech for a specific BandhuBol avatar
   */
  async speakAsAvatar(
    avatarId: string,
    text: string
  ): Promise<Buffer> {
    const voiceId = AVATAR_VOICES[avatarId] ?? AVATAR_VOICES.riya;
    
    return this.textToSpeech({
      text,
      voiceId,
    });
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getVoices() {
    const response = await this.client.voices.getAll();
    return response.voices;
  }
}

export function createTTSClient(config: ElevenLabsConfig): BandhuBolTTSClient {
  return new BandhuBolTTSClient(config);
}

