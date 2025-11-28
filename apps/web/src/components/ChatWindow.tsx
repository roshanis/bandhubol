import type { FormEvent } from "react";
import { useState, useRef, useEffect } from "react";

export type ChatMessageView = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export interface ChatWindowProps {
  messages: ChatMessageView[];
  onSend: (text: string) => void;
  isSending?: boolean;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
  isLoadingAudio?: boolean;
}

export function ChatWindow({ 
  messages, 
  onSend, 
  isSending,
  onSpeak,
  isSpeaking,
  isLoadingAudio,
}: ChatWindowProps) {
  const [draft, setDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setDraft("");
  };

  return (
    <div
      role="log"
      aria-label="BandhuBol chat"
      aria-live="polite"
      className="chat-window"
    >
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="chat-empty">
            Share what's on your mind.<br />
            Your companion is here to listen.
          </p>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message-${msg.role}`}
              >
                <div className="chat-bubble">
                  {msg.content}
                  {msg.role === "assistant" && onSpeak && (
                    <button
                      type="button"
                      className="speak-button"
                      onClick={() => onSpeak(msg.content)}
                      disabled={isLoadingAudio || isSpeaking}
                      aria-label={isSpeaking ? "Playing audio" : "Play message"}
                      title={isSpeaking ? "Playing..." : "Listen to message"}
                    >
                      {isLoadingAudio ? (
                        <span className="speak-loading">⏳</span>
                      ) : isSpeaking ? (
                        <span className="speak-playing">🔊</span>
                      ) : (
                        <span className="speak-icon">🔈</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="chat-input-row"
        onSubmit={handleSubmit}
      >
        <input
          aria-label="Type your message"
          className="chat-input"
          placeholder="Share whatever is on your mind..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={isSending || !draft.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
