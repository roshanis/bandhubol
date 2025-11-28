import { useState } from "react";
import {
  type AvatarPersona,
  type ConversationMessage,
  type LanguagePreference,
  type UserContext,
  runConversationTurn,
  type LanguageModelClient,
  type ChatMessage
} from "@bandhubol/core";
import type { ChatMessageView } from "../components/ChatWindow";

class DemoLlmClient implements LanguageModelClient {
  async chat(messages: ChatMessage[]): Promise<string> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const userText = lastUser?.content ?? "";
    return (
      "I’m here with you. This is a demo BandhuBol companion response.\n\n" +
      "You said: \"" +
      userText +
      "\". In the future, this reply will come from a real multilingual emotional AI tuned for your avatar and mood."
    );
  }
}

const demoUser: UserContext = {
  id: "demo-user",
  name: "Friend",
  preferredLanguage: "hinglish"
};

export function useDemoConversation(
  avatar: AvatarPersona | null,
  languagePreference: LanguagePreference
) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const llm = new DemoLlmClient();

  const send = async (text: string) => {
    if (!avatar) return;

    setIsSending(true);
    try {
      const result = await runConversationTurn(
        {
          user: demoUser,
          avatar,
          existingMessages: messages,
          userInput: text,
          languagePreference
        },
        { llm }
      );

      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const viewMessages: ChatMessageView[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content
  }));

  return {
    messages: viewMessages,
    isSending,
    send
  };
}

