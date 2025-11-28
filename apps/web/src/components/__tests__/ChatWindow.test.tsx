import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ChatWindow, type ChatMessageView } from "../ChatWindow";

describe("ChatWindow", () => {
  it("renders an empty state message when there are no messages", () => {
    render(
      <ChatWindow
        messages={[]}
        onSend={() => {}}
      />
    );

    expect(
      screen.getByText(/say hi to your bandhubol companion/i)
    ).toBeInTheDocument();
  });

  it("renders existing user and assistant messages", () => {
    const messages: ChatMessageView[] = [
      { id: "1", role: "user", content: "Hi" },
      { id: "2", role: "assistant", content: "Hello, I’m here for you." }
    ];

    render(
      <ChatWindow
        messages={messages}
        onSend={() => {}}
      />
    );

    expect(screen.getByText("Hi")).toBeInTheDocument();
    expect(
      screen.getByText("Hello, I’m here for you.")
    ).toBeInTheDocument();
  });

  it("calls onSend with trimmed input and clears the box", () => {
    const handleSend = vi.fn();

    render(
      <ChatWindow
        messages={[]}
        onSend={handleSend}
      />
    );

    const input = screen.getByLabelText(/type your message/i);
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "  hello  " } });
    fireEvent.click(button);

    expect(handleSend).toHaveBeenCalledTimes(1);
    expect(handleSend).toHaveBeenCalledWith("hello");
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("does not send when input is empty or only spaces", () => {
    const handleSend = vi.fn();

    render(
      <ChatWindow
        messages={[]}
        onSend={handleSend}
      />
    );

    const input = screen.getByLabelText(/type your message/i);
    const button = screen.getByRole("button", { name: /send/i });

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(button);

    expect(handleSend).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("   ");
  });
});
