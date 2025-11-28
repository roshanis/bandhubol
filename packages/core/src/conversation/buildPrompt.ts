import type {
  AvatarPersona,
  ChatMessage,
  ConversationMessage,
  LanguagePreference,
  UserContext
} from "../types";

export interface BuildPromptArgs {
  user: UserContext;
  avatar: AvatarPersona;
  messages: ConversationMessage[];
  languagePreference: LanguagePreference;
  safetyInstructions?: string;
  maxHistory?: number;
}

export function buildConversationPrompt(args: BuildPromptArgs): ChatMessage[] {
  const {
    user,
    avatar,
    messages,
    languagePreference,
    safetyInstructions,
    maxHistory = 20
  } = args;

  const systemMessages: ChatMessage[] = [];

  const baseSystem: ChatMessage = {
    role: "system",
    content:
      "You are an empathetic, non-judgmental AI companion called BandhuBol. " +
      "You provide emotional support, gentle reflections, and sensible, ethical relationship guidance. " +
      "You are not a therapist, doctor, or lawyer and must not present yourself as one."
  };

  const personaSystem: ChatMessage = {
    role: "system",
    content:
      `You are speaking as the avatar "${avatar.name}". ` +
      `${avatar.shortDescription} Your speaking style is: ${avatar.speakingStyle}.`
  };

  const languageHint = languagePreferenceToHint(languagePreference, user.name);

  const languageSystem: ChatMessage = {
    role: "system",
    content: languageHint
  };

  systemMessages.push(baseSystem, personaSystem, languageSystem);

  if (safetyInstructions && safetyInstructions.trim().length > 0) {
    systemMessages.push({
      role: "system",
      content: safetyInstructions
    });
  }

  const history = messages
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .slice(-maxHistory)
    .map<ChatMessage>((msg) => ({
      role: msg.role,
      content: msg.content
    }));

  return [...systemMessages, ...history];
}

function languagePreferenceToHint(
  language: LanguagePreference,
  userName?: string
): string {
  const namePart = userName ? ` When you address the user, you can use their name "${userName}" naturally.` : "";

  if (language === "hi") {
    return (
      "Respond primarily in natural, conversational Hindi, " +
      "using a warm and respectful tone suitable for Indian users." +
      namePart
    );
  }

  if (language === "hinglish") {
    return (
      "Respond in natural Hinglish (a mix of Hindi and English) " +
      "the way close Indian friends talk to each other: casual, kind, and emotionally aware." +
      namePart
    );
  }

  return (
    "Respond primarily in natural, conversational English with a warm, emotionally intelligent tone." +
    namePart
  );
}

