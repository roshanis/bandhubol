export type LanguagePreference = "en" | "hi" | "hinglish";

export type MoodTag =
  | "lonely"
  | "stressed"
  | "sad"
  | "anxious"
  | "neutral"
  | "hopeful"
  | "angry";

export interface UserContext {
  id: string;
  name?: string;
  preferredLanguage: LanguagePreference;
  moodTag?: MoodTag;
}

export interface AvatarPersona {
  id: string;
  name: string;
  shortDescription: string;
  speakingStyle: string;
  defaultLanguage: LanguagePreference;
}

export type ConversationRole = "user" | "assistant";

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
  moodTag?: MoodTag;
}

export type ChatMessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}
