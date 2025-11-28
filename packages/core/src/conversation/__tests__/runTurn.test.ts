import { describe, expect, it } from "vitest";
import type { AvatarPersona, ConversationMessage, UserContext } from "../../types";
import type { ChatMessage } from "../../types";
import { runConversationTurn, type ConversationTurnInput, type LanguageModelClient } from "../runTurn";

class FakeLlmClient implements LanguageModelClient {
  public lastPrompt: ChatMessage[] | null = null;
  public responseText = "This is a test response.";

  async chat(messages: ChatMessage[]): Promise<string> {
    this.lastPrompt = messages;
    return this.responseText;
  }
}

function makeBaseInput(overrides: Partial<ConversationTurnInput> = {}): ConversationTurnInput {
  const user: UserContext = {
    id: "user-1",
    name: "Aarav",
    preferredLanguage: "hinglish",
    moodTag: "lonely"
  };

  const avatar: AvatarPersona = {
    id: "avatar-1",
    name: "Riya",
    shortDescription:
      "A warm, emotionally intelligent friend who listens first and then gently responds.",
    speakingStyle: "Soft, caring, a bit playful, uses simple language.",
    defaultLanguage: "hinglish"
  };

  const existingMessages: ConversationMessage[] = [
    {
      id: "m1",
      role: "user",
      content: "Hey, I had a rough day at work.",
      createdAt: "2024-01-01T10:00:00.000Z",
      moodTag: "stressed"
    }
  ];

  return {
    user,
    avatar,
    existingMessages,
    userInput: "I feel so lonely right now.",
    languagePreference: "hinglish",
    safetyInstructions:
      "Never give explicit sexual content, self-harm encouragement, or medical/legal advice.",
    maxHistory: 10,
    ...overrides
  };
}

describe("runConversationTurn", () => {
  it("creates new user and assistant messages and calls the LLM with full prompt", async () => {
    const llm = new FakeLlmClient();
    const fixedNow = new Date("2024-01-01T12:00:00.000Z");

    const input = makeBaseInput();

    const result = await runConversationTurn(input, {
      llm,
      now: () => fixedNow
    });

    expect(result.userMessage.role).toBe("user");
    expect(result.assistantMessage.role).toBe("assistant");
    expect(result.userMessage.createdAt).toBe(fixedNow.toISOString());
    expect(result.assistantMessage.createdAt).toBe(fixedNow.toISOString());

    expect(result.userMessage.moodTag).toBe("lonely");
    expect(result.assistantMessage.content).toBe(llm.responseText);

    expect(llm.lastPrompt).not.toBeNull();
    const lastPrompt = llm.lastPrompt!;
    const lastMessage = lastPrompt[lastPrompt.length - 1];
    expect(lastMessage.role).toBe("user");
    expect(lastMessage.content).toBe(input.userInput);
  });

  it("respects maxHistory when building the prompt", async () => {
    const llm = new FakeLlmClient();
    const fixedNow = new Date("2024-01-01T12:00:00.000Z");

    const existingMessages: ConversationMessage[] = [];
    for (let i = 0; i < 25; i += 1) {
      existingMessages.push({
        id: `m-${i}`,
        role: i % 2 === 0 ? "user" : "assistant",
        content: `message-${i}`,
        createdAt: `2024-01-01T10:${i.toString().padStart(2, "0")}:00.000Z`
      });
    }

    const input = makeBaseInput({
      existingMessages,
      maxHistory: 5
    });

    await runConversationTurn(input, {
      llm,
      now: () => fixedNow
    });

    const lastPrompt = llm.lastPrompt!;
    const historyMessages = lastPrompt.filter(
      (m) => m.role === "user" || m.role === "assistant"
    );

    expect(historyMessages.length).toBe(5);
    const contents = historyMessages.map((m) => m.content);
    expect(contents[0]).toBe("message-21");
    expect(contents[3]).toBe("message-24");
    expect(contents[4]).toBe(input.userInput);
  });
}
);
