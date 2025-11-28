# BandhuBol Setup Guide

## Prerequisites

- Node.js v20.0.0 or higher
- npm or yarn
- OpenAI API key
- (Optional) Supabase account for message persistence
- (Optional) ElevenLabs API key for text-to-speech

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Create a `.env.local` file in `apps/web/` with the following:

```bash
# OpenAI Configuration (required)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-5-mini

# Supabase Configuration (optional - enables message persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# ElevenLabs Configuration (optional - enables voice responses)
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here

# Custom Voice IDs (optional - override default voices)
# Find voices at: https://elevenlabs.io/voice-library
# ELEVENLABS_VOICE_RIYA=your-voice-id-for-riya
# ELEVENLABS_VOICE_ARJUN=your-voice-id-for-arjun
# ELEVENLABS_VOICE_MEERA=your-voice-id-for-meera
# ELEVENLABS_VOICE_KABIR=your-voice-id-for-kabir
```

### Getting Your API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it to `OPENAI_API_KEY`

**GPT-5 Model Options:**
- `gpt-5` — Full model, maximum capability
- `gpt-5-mini` — Faster, cost-efficient (default)
- `gpt-5-nano` — Lightweight, fastest

**GPT-5 Parameters (configured in code):**
- `verbosity`: Controls response length (`low`, `medium`, `high`)
- `reasoning_effort`: Controls reasoning depth (`minimal`, `default`, `high`)

#### Supabase (Optional)
1. Create a project at [Supabase](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL to `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### ElevenLabs (Optional - for voice)
1. Create an account at [ElevenLabs](https://elevenlabs.io)
2. Go to Profile Settings > API Keys
3. Create a new API key
4. Copy it to `ELEVENLABS_API_KEY`

## 3. Supabase Database Setup (Optional)

If you want message persistence, run the migration in your Supabase SQL Editor:

```sql
-- Copy contents from supabase/migrations/001_create_messages_table.sql
```

Or use the Supabase CLI:

```bash
cd supabase
supabase db push
```

## 4. Build the Core Package

```bash
cd packages/core
npm run build
```

## 5. Run the Development Server

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

```
bandhubol/
├── apps/
│   └── web/                 # Next.js frontend
│       ├── app/
│       │   ├── api/chat/    # Chat API route (calls OpenAI)
│       │   ├── api/tts/     # Text-to-speech API (calls ElevenLabs)
│       │   └── page.tsx     # Main chat UI
│       └── src/
│           ├── components/  # React components
│           └── hooks/       # Custom hooks
├── packages/
│   └── core/                # Shared business logic
│       └── src/
│           ├── conversation/ # Prompt building, turn handling
│           ├── openai/       # OpenAI client wrapper
│           ├── elevenlabs/   # ElevenLabs TTS client
│           ├── supabase/     # Supabase persistence
│           └── safety/       # Mood detection
└── supabase/
    └── migrations/          # Database schemas
```

## API Flow

1. User types a message in the chat
2. Frontend calls `POST /api/chat` with the message
3. API route:
   - Fetches conversation history from Supabase (if configured)
   - Builds a prompt with avatar personality and language preference
   - Calls OpenAI for a response
   - Saves the exchange to Supabase (if configured)
   - Returns the response to frontend
4. Frontend displays the response

## Supported Languages

- **English** (`en`)
- **Hindi** (`hi`)
- **Hinglish** (`hinglish`) - Default, natural mix of Hindi and English

## Available Avatars

| Avatar | Personality | Style |
|--------|-------------|-------|
| Riya 🌸 | Warm, caring | Soft & empathetic |
| Arjun 🌿 | Calm, logical | Grounded & practical |
| Meera ✨ | Playful, friendly | Playful & supportive |
| Kabir 🔮 | Direct but kind | Honest & thoughtful |

## Voice Features (ElevenLabs)

Each avatar has a unique voice powered by ElevenLabs:

| Avatar | Voice Style | Default Voice | Voice ID |
|--------|-------------|---------------|----------|
| Riya 🌸 | Warm, empathetic | Rachel | `21m00Tcm4TlvDq8ikWAM` |
| Arjun 🌿 | Calm, grounded | Antoni | `ErXwobaYiN019PkySvjV` |
| Meera ✨ | Friendly, playful | Bella | `EXAVITQu4vr4xnSDxMaL` |
| Kabir 🔮 | Direct, thoughtful | Arnold | `VR6AewLTigWG4xSOukaG` |

Click the 🔈 button on any assistant message to hear it spoken aloud.

The voices use the `eleven_multilingual_v2` model for natural Hindi/Hinglish support.

### Customizing Voices

1. Go to [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Search for "Hindi" or "Indian" voices
3. Click "Add to VoiceLab" on voices you like
4. Go to VoiceLab, click ⋮ on the voice → "Copy Voice ID"
5. Add to your environment variables:

```bash
ELEVENLABS_VOICE_RIYA=your-custom-voice-id
ELEVENLABS_VOICE_ARJUN=your-custom-voice-id
ELEVENLABS_VOICE_MEERA=your-custom-voice-id
ELEVENLABS_VOICE_KABIR=your-custom-voice-id
```

