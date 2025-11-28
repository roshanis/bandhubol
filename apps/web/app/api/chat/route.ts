import { NextRequest, NextResponse } from "next/server";
import {
  createOpenAIClient,
  createSupabaseClient,
  createMessageStore,
  runConversationTurn,
  type AvatarPersona,
  type LanguagePreference,
  type UserContext,
  type ConversationMessage,
} from "@bandhubol/core";

// Avatar definitions (should match frontend)
const avatarPersonas: Record<string, AvatarPersona> = {
  riya: {
    id: "riya",
    name: "Riya",
    shortDescription: "Warm, caring, helps you process feelings and feel heard.",
    speakingStyle: "Soft & empathetic",
    defaultLanguage: "hinglish",
  },
  arjun: {
    id: "arjun",
    name: "Arjun",
    shortDescription: "Calm, logical, helps you think through decisions.",
    speakingStyle: "Grounded & practical",
    defaultLanguage: "hinglish",
  },
  meera: {
    id: "meera",
    name: "Meera",
    shortDescription: "Playful, friendly, helps you lighten the mood.",
    speakingStyle: "Playful & supportive",
    defaultLanguage: "hinglish",
  },
  kabir: {
    id: "kabir",
    name: "Kabir",
    shortDescription: "Direct but kind, helps you see things clearly.",
    speakingStyle: "Honest & thoughtful",
    defaultLanguage: "hinglish",
  },
};

export interface ChatRequest {
  message: string;
  avatarId: string;
  languagePreference: LanguagePreference;
  userId?: string;
  existingMessages?: ConversationMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, avatarId, languagePreference, userId, existingMessages } = body;

    // Validate inputs
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!avatarId || !avatarPersonas[avatarId]) {
      return NextResponse.json(
        { error: "Valid avatar ID is required" },
        { status: 400 }
      );
    }

    // Check for required environment variables
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Create OpenAI client (using gpt-5 as default)
    const llm = createOpenAIClient({
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL ?? "gpt-5",
      temperature: 0.8,
      maxTokens: 1024,
    });

    const avatar = avatarPersonas[avatarId];
    const effectiveUserId = userId ?? "anonymous-user";

    // Create user context
    const user: UserContext = {
      id: effectiveUserId,
      preferredLanguage: languagePreference ?? "hinglish",
    };

    // Check if Supabase is configured for persistence
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    let messages: ConversationMessage[] = existingMessages ?? [];

    // If Supabase is configured, fetch existing messages
    if (supabaseUrl && supabaseKey) {
      const supabase = createSupabaseClient({
        url: supabaseUrl,
        anonKey: supabaseKey,
      });
      
      const store = createMessageStore(supabase, effectiveUserId, avatarId);
      
      try {
        // Fetch recent messages if none provided
        if (!existingMessages || existingMessages.length === 0) {
          messages = await store.fetchRecentMessages(effectiveUserId, avatarId, 20);
        }

        // Run conversation turn
        const result = await runConversationTurn(
          {
            user,
            avatar,
            existingMessages: messages,
            userInput: message,
            languagePreference: languagePreference ?? "hinglish",
          },
          { llm }
        );

        // Save to Supabase
        await store.saveMessagePair(
          result.userMessage,
          result.assistantMessage,
          result.moodTag
        );

        return NextResponse.json({
          userMessage: result.userMessage,
          assistantMessage: result.assistantMessage,
          moodTag: result.moodTag,
        });
      } catch (dbError) {
        console.error("Database error, falling back to stateless:", dbError);
        // Fall through to stateless mode
      }
    }

    // Stateless mode (no Supabase or DB error)
    const result = await runConversationTurn(
      {
        user,
        avatar,
        existingMessages: messages,
        userInput: message,
        languagePreference: languagePreference ?? "hinglish",
      },
      { llm }
    );

    return NextResponse.json({
      userMessage: result.userMessage,
      assistantMessage: result.assistantMessage,
      moodTag: result.moodTag,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: "Failed to process message", details: errorMessage },
      { status: 500 }
    );
  }
}

