import type {
  AvatarPersona,
  ConversationMessage,
  LanguagePreference,
  UserContext
} from "../types";
import type { MoodTag } from "../types";
import {
  runConversationTurn,
  type ConversationTurnInput,
  type ConversationTurnResult,
  type LanguageModelClient
} from "../conversation/runTurn";

export interface MessagePersistence {
  fetchRecentMessages(
    userId: string,
    avatarId: string,
    limit: number
  ): Promise<ConversationMessage[]>;
  saveMessagePair(
    userMessage: ConversationMessage,
    assistantMessage: ConversationMessage,
    moodTag: MoodTag
  ): Promise<void>;
}

export interface SupabaseConversationInput {
  user: UserContext;
  avatar: AvatarPersona;
  userInput: string;
  languagePreference?: LanguagePreference;
  safetyInstructions?: string;
  maxHistory?: number;
  historyLimitForFetch?: number;
}

export interface SupabaseConversationDeps {
  llm: LanguageModelClient;
  store: MessagePersistence;
  now?: () => Date;
}

export async function handleConversationTurnWithStore(
  input: SupabaseConversationInput,
  deps: SupabaseConversationDeps
): Promise<ConversationTurnResult> {
  const language =
    input.languagePreference ??
    input.user.moodTag?.length
      ? input.user.preferredLanguage
      : input.avatar.defaultLanguage;

  const existingMessages = await deps.store.fetchRecentMessages(
    input.user.id,
    input.avatar.id,
    input.historyLimitForFetch ?? (input.maxHistory ?? 20)
  );

  const turnInput: ConversationTurnInput = {
    user: input.user,
    avatar: input.avatar,
    existingMessages,
    userInput: input.userInput,
    languagePreference: language,
    safetyInstructions: input.safetyInstructions,
    maxHistory: input.maxHistory
  };

  const result = await runConversationTurn(turnInput, {
    llm: deps.llm,
    now: deps.now
  });

  await deps.store.saveMessagePair(
    result.userMessage,
    result.assistantMessage,
    result.moodTag
  );

  return result;
}

