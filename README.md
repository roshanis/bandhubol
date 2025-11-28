# 🌸 BandhuBol

> *A friend who speaks with you*

BandhuBol is an AI-powered emotional companion that supports you through life's ups and downs. Chat in **English**, **Hindi**, or **Hinglish** with empathetic AI avatars who listen, understand, and respond with care.

![BandhuBol](https://img.shields.io/badge/AI-Emotional_Companion-e07a5f?style=for-the-badge)
![GPT-5](https://img.shields.io/badge/Powered_by-GPT--5_Mini-412991?style=for-the-badge)
![ElevenLabs](https://img.shields.io/badge/Voice-ElevenLabs-000000?style=for-the-badge)

## ✨ Features

### 🎭 Four Unique Avatars
Each companion has their own personality and voice:

| Avatar | Personality | Voice Style |
|--------|-------------|-------------|
| 🌸 **Riya** | Warm, caring | Soft & empathetic |
| 🌿 **Arjun** | Calm, logical | Grounded & practical |
| ✨ **Meera** | Playful, friendly | Playful & supportive |
| 🔮 **Kabir** | Direct but kind | Honest & thoughtful |

### 🗣️ Multilingual Support
- **English** — Full support
- **Hindi** — Native Hindi conversations
- **Hinglish** — Natural code-mixing (default)

### 🔊 Voice Responses
Click the 🔈 button to hear your companion speak using ElevenLabs' multilingual voices.

### 💾 Conversation History
Messages are saved to Supabase so your companion remembers your conversations.

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- OpenAI API key
- (Optional) ElevenLabs API key for voice
- (Optional) Supabase account for persistence

### Installation

```bash
# Clone the repository
git clone https://github.com/roshanis/bandhubol.git
cd bandhubol

# Install dependencies
npm install

# Build the core package
cd packages/core && npm run build && cd ../..

# Start development server
cd apps/web && npm run dev
```

### Environment Variables

Create `apps/web/.env.local`:

```bash
# Required
OPENAI_API_KEY=sk-your-openai-api-key

# Optional - defaults to gpt-5-mini
OPENAI_MODEL=gpt-5-mini

# Optional - enables voice responses
ELEVENLABS_API_KEY=your-elevenlabs-key

# Optional - enables message persistence
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 🏗️ Architecture

```
bandhubol/
├── apps/
│   └── web/                    # Next.js 14 frontend
│       ├── app/
│       │   ├── api/chat/       # Chat API (GPT-5)
│       │   ├── api/tts/        # Voice API (ElevenLabs)
│       │   └── page.tsx        # Main UI
│       └── src/
│           ├── components/     # React components
│           └── hooks/          # Custom hooks
├── packages/
│   └── core/                   # Shared business logic
│       └── src/
│           ├── openai/         # GPT-5 client
│           ├── elevenlabs/     # TTS client
│           ├── supabase/       # Database client
│           ├── conversation/   # Prompt building
│           └── safety/         # Mood detection
└── supabase/
    └── migrations/             # Database schema
```

## 🤖 GPT-5 Integration

BandhuBol uses **GPT-5 Mini** with optimized parameters for emotional support:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `model` | `gpt-5-mini` | Fast, cost-efficient |
| `verbosity` | `medium` | Balanced responses |
| `reasoning_effort` | `medium` | Thoughtful support |
| `max_completion_tokens` | `4096` | Detailed replies |

### Available Models
- `gpt-5` — Maximum capability
- `gpt-5-mini` — Balanced (default)
- `gpt-5-nano` — Fastest, lightest

## 🔊 Voice Integration

Each avatar has a unique ElevenLabs voice using the `eleven_multilingual_v2` model for natural Hindi/Hinglish support.

### Default Voices
| Avatar | Voice |
|--------|-------|
| Riya | Rachel |
| Arjun | Antoni |
| Meera | Bella |
| Kabir | Arnold |

### Custom Voices
Override defaults with environment variables:
```bash
ELEVENLABS_VOICE_RIYA=custom-voice-id
ELEVENLABS_VOICE_ARJUN=custom-voice-id
```

## 💾 Database Setup (Optional)

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mood_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_user_avatar ON messages(user_id, avatar_id);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON messages FOR ALL USING (true);
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **AI**: OpenAI GPT-5 Mini
- **Voice**: ElevenLabs TTS
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS with custom design system
- **Monorepo**: Turborepo

## 📝 License

MIT

## 🙏 Acknowledgments

- OpenAI for GPT-5
- ElevenLabs for multilingual TTS
- Supabase for database infrastructure

---

<p align="center">
  Made with ❤️ for everyone who needs a friend to talk to
</p>

