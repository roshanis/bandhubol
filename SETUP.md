# BandhuBol Setup Guide

## Prerequisites

- Node.js v20.0.0 or higher
- npm or yarn
- OpenAI API key
- (Optional) Supabase account for message persistence

## 1. Install Dependencies

```bash
npm install
```

## 2. Environment Variables

Create a `.env.local` file in `apps/web/` with the following:

```bash
# OpenAI Configuration (required)
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo

# Supabase Configuration (optional - enables message persistence)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

### Getting Your API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy it to `OPENAI_API_KEY`

#### Supabase (Optional)
1. Create a project at [Supabase](https://supabase.com)
2. Go to Project Settings > API
3. Copy the Project URL to `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `anon` public key to `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
│       │   └── page.tsx     # Main chat UI
│       └── src/
│           ├── components/  # React components
│           └── hooks/       # Custom hooks
├── packages/
│   └── core/                # Shared business logic
│       └── src/
│           ├── conversation/ # Prompt building, turn handling
│           ├── openai/       # OpenAI client wrapper
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

