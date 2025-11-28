import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AvatarPicker, type AvatarOption } from "../AvatarPicker";

const avatars: AvatarOption[] = [
  {
    id: "riya",
    name: "Riya",
    shortDescription: "Warm, caring, helps you process feelings.",
    toneLabel: "Soft & empathetic"
  },
  {
    id: "arjun",
    name: "Arjun",
    shortDescription: "Calm, logical, helps you think clearly.",
    toneLabel: "Grounded & practical"
  }
];

describe("AvatarPicker", () => {
  it("renders all avatar options", () => {
    render(
      <AvatarPicker
        avatars={avatars}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText("Riya")).toBeInTheDocument();
    expect(screen.getByText("Arjun")).toBeInTheDocument();
  });

  it("calls onSelect when an avatar is clicked", () => {
    const handleSelect = vi.fn();

    render(
      <AvatarPicker
        avatars={avatars}
        onSelect={handleSelect}
      />
    );

    const button = screen.getByRole("button", { name: /Riya/i });
    fireEvent.click(button);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("riya");
  });

  it("applies selected styling when selectedId matches", () => {
    const { rerender } = render(
      <AvatarPicker
        avatars={avatars}
        selectedId={undefined}
        onSelect={() => {}}
      />
    );

    const riyaButton = screen.getByRole("button", { name: /Riya/i });
    expect(riyaButton.className).not.toContain("avatar-card-selected");

    rerender(
      <AvatarPicker
        avatars={avatars}
        selectedId="riya"
        onSelect={() => {}}
      />
    );

    expect(riyaButton.className).toContain("avatar-card-selected");
  });
});

