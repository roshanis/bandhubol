-- Create messages table for storing conversation history
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  mood_tag TEXT CHECK (mood_tag IN ('lonely', 'stressed', 'sad', 'anxious', 'neutral', 'hopeful', 'angry')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for efficient querying
  CONSTRAINT valid_role CHECK (role IN ('user', 'assistant'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_messages_user_avatar ON messages(user_id, avatar_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own messages
CREATE POLICY "Users can read own messages" ON messages
  FOR SELECT
  USING (true);  -- For demo purposes. In production, use auth.uid() = user_id

-- Create policy to allow inserting messages
CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT
  WITH CHECK (true);  -- For demo purposes. In production, use auth.uid() = user_id

-- Optional: Create conversations table for grouping
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  avatar_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, avatar_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conversations" ON conversations
  FOR ALL
  USING (true);  -- For demo purposes

