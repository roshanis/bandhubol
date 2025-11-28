import { describe, expect, it } from "vitest";
import {
  buildConversationPrompt,
  type BuildPromptArgs
} from "../buildPrompt";
import type {
  AvatarPersona,
  ConversationMessage,
  UserContext
} from "../../types";

function makeArgs(overrides: Partial<BuildPromptArgs> = {}): BuildPromptArgs {
  const user: UserContext = {
    id: "user-1",
    name: "Aarav",
    preferredLanguage: "hinglish",
    moodTag: "lonely"
  };

  const avatar: AvatarPersona = {
    id: "avatar-1",
    name: "Riya",
    shortDescription: "A warm, emotionally intelligent friend who listens first and then gently responds.",
    speakingStyle: "Soft, caring, a bit playful, uses simple language.",
    defaultLanguage: "hinglish"
  };

  const messages: ConversationMessage[] = [
    {
      id: "m1",
      role: "user",
      content: "Hey, I had a rough day at work.",
      createdAt: "2024-01-01T10:00:00.000Z"
    },
    {
      id: "m2",
      role: "assistant",
      content: "I’m here for you. Want to tell me what happened?",
      createdAt: "2024-01-01T10:01:00.000Z"
    }
  ];

  return {
    user,
    avatar,
    messages,
    languagePreference: "hinglish",
    safetyInstructions:
      "Never give explicit sexual content, self-harm encouragement, or medical/legal advice. " +
      "If the user seems in crisis, respond with empathy and encourage seeking real-world help.",
    maxHistory: 10,
    ...overrides
  };
}

describe("buildConversationPrompt", () => {
  it("includes base system, persona, language, and safety instructions", () => {
    const args = makeArgs();
    const prompt = buildConversationPrompt(args);

    const systemMessages = prompt.filter((m) => m.role === "system");

    expect(systemMessages.length).toBeGreaterThanOrEqual(3);
    expect(systemMessages[0].content).toContain("BandhuBol");
    expect(systemMessages[1].content).toContain(args.avatar.name);
    expect(systemMessages[2].content.toLowerCase()).toContain("hinglish");

    const hasSafety = systemMessages.some((m) =>
      m.content.toLowerCase().includes("self-harm")
    );
    expect(hasSafety).toBe(true);
  });

  it("appends conversation history in chronological order limited by maxHistory", () => {
    const manyMessages: ConversationMessage[] = [];
    for (let i = 0; i < 30; i += 1) {
      manyMessages.push({
        id: `m-${i}`,
        role: i % 2 === 0 ? "user" : "assistant",
        content: `message-${i}`,
        createdAt: `2024-01-01T10:${i.toString().padStart(2, "0")}:00.000Z`
      });
    }

    const maxHistory = 5;
    const args = makeArgs({
      messages: manyMessages,
      maxHistory
    });

    const prompt = buildConversationPrompt(args);

    const history = prompt.filter(
      (m) => m.role === "user" || m.role === "assistant"
    );

    expect(history).toHaveLength(maxHistory);

    const contents = history.map((m) => m.content);
    expect(contents[0]).toBe("message-25");
    expect(contents[4]).toBe("message-29");
  });

  it("adds appropriate language hint for Hindi and English", () => {
    const base = makeArgs();

    const hindiPrompt = buildConversationPrompt({
      ...base,
      languagePreference: "hi"
    });
    const hindiLanguageMessage = hindiPrompt.filter(
      (m) => m.role === "system"
    )[2];
    expect(hindiLanguageMessage.content.toLowerCase()).toContain("hindi");

    const englishPrompt = buildConversationPrompt({
      ...base,
      languagePreference: "en"
    });
    const englishLanguageMessage = englishPrompt.filter(
      (m) => m.role === "system"
    )[2];
    expect(englishLanguageMessage.content.toLowerCase()).toContain("english");
  });
});

