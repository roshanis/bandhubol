import type {
  AvatarPersona,
  ConversationMessage,
  LanguagePreference,
  MoodTag,
  UserContext
} from "../types";
import type { ChatMessage } from "../types";
import { buildConversationPrompt } from "./buildPrompt";
import { inferMoodTag } from "../safety/mood";

export interface LanguageModelClient {
  chat(messages: ChatMessage[]): Promise<string>;
}

export interface ConversationTurnInput {
  user: UserContext;
  avatar: AvatarPersona;
  existingMessages: ConversationMessage[];
  userInput: string;
  languagePreference: LanguagePreference;
  safetyInstructions?: string;
  maxHistory?: number;
}

export interface ConversationTurnResult {
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  moodTag: MoodTag;
}

export interface ConversationTurnDeps {
  llm: LanguageModelClient;
  now?: () => Date;
}

export async function runConversationTurn(
  input: ConversationTurnInput,
  deps: ConversationTurnDeps
): Promise<ConversationTurnResult> {
  const now = (deps.now ?? (() => new Date()))();
  const createdAt = now.toISOString();

  const moodTag: MoodTag = inferMoodTag(input.userInput);

  const userMessage: ConversationMessage = {
    id: `user-${createdAt}`,
    role: "user",
    content: input.userInput,
    createdAt,
    moodTag
  };

  const allMessages: ConversationMessage[] = [...input.existingMessages, userMessage];

  const prompt = buildConversationPrompt({
    user: input.user,
    avatar: input.avatar,
    messages: allMessages,
    languagePreference: input.languagePreference,
    safetyInstructions: input.safetyInstructions,
    maxHistory: input.maxHistory
  });

  const assistantContent = await deps.llm.chat(prompt);

  const assistantMessage: ConversationMessage = {
    id: `assistant-${createdAt}`,
    role: "assistant",
    content: assistantContent,
    createdAt
  };

  return {
    userMessage,
    assistantMessage,
    moodTag
  };
}

