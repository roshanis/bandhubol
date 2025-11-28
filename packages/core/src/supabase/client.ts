import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ConversationMessage, MoodTag } from "../types";
import type { MessagePersistence } from "./conversationHandler";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Database types matching Supabase schema
export interface MessageRow {
  id: string;
  user_id: string;
  avatar_id: string;
  role: "user" | "assistant";
  content: string;
  mood_tag: MoodTag | null;
  created_at: string;
}

export interface MessageInsert {
  id?: string;
  user_id: string;
  avatar_id: string;
  role: "user" | "assistant";
  content: string;
  mood_tag?: MoodTag | null;
  created_at?: string;
}

export class SupabaseMessageStore implements MessagePersistence {
  private client: SupabaseClient;
  private userId: string;
  private avatarId: string;

  constructor(
    client: SupabaseClient,
    userId: string,
    avatarId: string
  ) {
    this.client = client;
    this.userId = userId;
    this.avatarId = avatarId;
  }

  async fetchRecentMessages(
    userId: string,
    avatarId: string,
    limit: number
  ): Promise<ConversationMessage[]> {
    const { data, error } = await this.client
      .from("messages")
      .select("*")
      .eq("user_id", userId)
      .eq("avatar_id", avatarId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching messages:", error);
      return [];
    }

    const rows = data as MessageRow[] | null;

    // Reverse to get chronological order
    return (rows ?? []).reverse().map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      createdAt: row.created_at,
      moodTag: row.mood_tag ?? undefined,
    }));
  }

  async saveMessagePair(
    userMessage: ConversationMessage,
    assistantMessage: ConversationMessage,
    moodTag: MoodTag
  ): Promise<void> {
    const messages: MessageInsert[] = [
      {
        id: userMessage.id,
        user_id: this.userId,
        avatar_id: this.avatarId,
        role: userMessage.role as "user" | "assistant",
        content: userMessage.content,
        mood_tag: moodTag,
        created_at: userMessage.createdAt,
      },
      {
        id: assistantMessage.id,
        user_id: this.userId,
        avatar_id: this.avatarId,
        role: assistantMessage.role as "user" | "assistant",
        content: assistantMessage.content,
        mood_tag: null,
        created_at: assistantMessage.createdAt,
      },
    ];

    const { error } = await this.client.from("messages").insert(messages);

    if (error) {
      console.error("Error saving messages:", error);
      throw new Error(`Failed to save messages: ${error.message}`);
    }
  }
}

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.anonKey);
}

export function createMessageStore(
  client: SupabaseClient,
  userId: string,
  avatarId: string
): MessagePersistence {
  return new SupabaseMessageStore(client, userId, avatarId);
}
