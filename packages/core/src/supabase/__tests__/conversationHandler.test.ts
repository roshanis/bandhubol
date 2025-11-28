import { describe, expect, it } from "vitest";
import type {
  AvatarPersona,
  ConversationMessage,
  UserContext
} from "../../types";
import type { ChatMessage } from "../../types";
import type { LanguageModelClient } from "../../conversation/runTurn";
import {
  handleConversationTurnWithStore,
  type MessagePersistence
} from "../conversationHandler";

class FakeStore implements MessagePersistence {
  public fetchedForUser: string | null = null;
  public fetchedForAvatar: string | null = null;
  public fetchLimit: number | null = null;
  public existing: ConversationMessage[] = [];

  public savedUserMessage: ConversationMessage | null = null;
  public savedAssistantMessage: ConversationMessage | null = null;

  async fetchRecentMessages(
    userId: string,
    avatarId: string,
    limit: number
  ): Promise<ConversationMessage[]> {
    this.fetchedForUser = userId;
    this.fetchedForAvatar = avatarId;
    this.fetchLimit = limit;
    return this.existing;
  }

  async saveMessagePair(
    userMessage: ConversationMessage,
    assistantMessage: ConversationMessage
  ): Promise<void> {
    this.savedUserMessage = userMessage;
    this.savedAssistantMessage = assistantMessage;
  }
}

class FakeLlm implements LanguageModelClient {
  public lastPrompt: ChatMessage[] | null = null;
  async chat(messages: ChatMessage[]): Promise<string> {
    this.lastPrompt = messages;
    return "assistant reply";
  }
}

function makeUser(): UserContext {
  return {
    id: "user-1",
    name: "Aarav",
    preferredLanguage: "hinglish",
    moodTag: "lonely"
  };
}

function makeAvatar(): AvatarPersona {
  return {
    id: "avatar-1",
    name: "Riya",
    shortDescription:
      "A warm, emotionally intelligent friend who listens first and then gently responds.",
    speakingStyle: "Soft, caring, a bit playful, uses simple language.",
    defaultLanguage: "hinglish"
  };
}

describe("handleConversationTurnWithStore", () => {
  it("fetches recent messages, runs a conversation turn, and saves both messages", async () => {
    const store = new FakeStore();
    store.existing = [
      {
        id: "m1",
        role: "user",
        content: "I had a rough day.",
        createdAt: "2024-01-01T10:00:00.000Z",
        moodTag: "stressed"
      }
    ];

    const llm = new FakeLlm();
    const fixedNow = new Date("2024-01-01T12:00:00.000Z");

    const result = await handleConversationTurnWithStore(
      {
        user: makeUser(),
        avatar: makeAvatar(),
        userInput: "I feel really alone right now.",
        maxHistory: 10
      },
      {
        llm,
        store,
        now: () => fixedNow
      }
    );

    expect(store.fetchedForUser).toBe("user-1");
    expect(store.fetchedForAvatar).toBe("avatar-1");
    expect(store.fetchLimit).toBe(10);

    expect(store.savedUserMessage).not.toBeNull();
    expect(store.savedAssistantMessage).not.toBeNull();

    expect(store.savedUserMessage?.role).toBe("user");
    expect(store.savedAssistantMessage?.role).toBe("assistant");

    expect(result.userMessage.id).toBe(store.savedUserMessage?.id);
    expect(result.assistantMessage.id).toBe(store.savedAssistantMessage?.id);
  });
});

