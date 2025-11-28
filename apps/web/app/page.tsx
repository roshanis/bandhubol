"use client";

import { useMemo, useState } from "react";
import { ChatWindow } from "../src/components/ChatWindow";
import { AvatarPicker, type AvatarOption } from "../src/components/AvatarPicker";
import { useDemoConversation } from "../src/hooks/useDemoConversation";
import type { AvatarPersona, LanguagePreference } from "@bandhubol/core";

const defaultAvatars: AvatarOption[] = [
  {
    id: "riya",
    name: "Riya",
    shortDescription: "Warm, caring, helps you process feelings and feel heard.",
    toneLabel: "Soft & empathetic"
  },
  {
    id: "arjun",
    name: "Arjun",
    shortDescription: "Calm, logical, helps you think through decisions.",
    toneLabel: "Grounded & practical"
  },
  {
    id: "meera",
    name: "Meera",
    shortDescription: "Playful, friendly, helps you lighten the mood.",
    toneLabel: "Playful & supportive"
  },
  {
    id: "kabir",
    name: "Kabir",
    shortDescription: "Direct but kind, helps you see things clearly.",
    toneLabel: "Honest & thoughtful"
  }
];

function avatarOptionToPersona(option: AvatarOption): AvatarPersona {
  return {
    id: option.id,
    name: option.name,
    shortDescription: option.shortDescription,
    speakingStyle: option.toneLabel,
    defaultLanguage: "hinglish"
  };
}

export default function HomePage() {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("riya");
  const [languagePreference] = useState<LanguagePreference>("hinglish");

  const selectedAvatarPersona = useMemo<AvatarPersona | null>(() => {
    const avatar = defaultAvatars.find((a) => a.id === selectedAvatarId);
    return avatar ? avatarOptionToPersona(avatar) : null;
  }, [selectedAvatarId]);

  const { messages, isSending, send } = useDemoConversation(
    selectedAvatarPersona,
    languagePreference
  );

  return (
    <main className="page">
      <section className="hero">
        <div className="hero-copy">
          <h1>BandhuBol</h1>
          <p>
            A friend who speaks with you. Share your thoughts in English, Hindi, or Hinglish — 
            your AI companion is here to listen, understand, and support you.
          </p>
          <p className="hero-sub">
            Choose a companion below and start the conversation
          </p>
        </div>
      </section>
      <section className="chat-section">
        <AvatarPicker
          avatars={defaultAvatars}
          selectedId={selectedAvatarId}
          onSelect={setSelectedAvatarId}
        />
        <ChatWindow
          messages={messages}
          isSending={isSending}
          onSend={send}
        />
      </section>
    </main>
  );
}
