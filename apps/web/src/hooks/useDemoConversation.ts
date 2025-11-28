import { useState, useCallback } from "react";
import type {
  AvatarPersona,
  ConversationMessage,
  LanguagePreference,
} from "@bandhubol/core";
import type { ChatMessageView } from "../components/ChatWindow";

interface ChatApiResponse {
  userMessage: ConversationMessage;
  assistantMessage: ConversationMessage;
  moodTag: string;
  error?: string;
}

export function useDemoConversation(
  avatar: AvatarPersona | null,
  languagePreference: LanguagePreference
) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    if (!avatar) return;

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          avatarId: avatar.id,
          languagePreference,
          existingMessages: messages,
        }),
      });

      const data: ChatApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send message");
      }

      setMessages((prev) => [...prev, data.userMessage, data.assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      console.error("Chat error:", err);
    } finally {
      setIsSending(false);
    }
  }, [avatar, languagePreference, messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const viewMessages: ChatMessageView[] = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
  }));

  return {
    messages: viewMessages,
    isSending,
    error,
    send,
    clearMessages,
  };
}
