import { describe, expect, it } from "vitest";
import { detectCrisis, inferMoodTag } from "../mood";

describe("inferMoodTag", () => {
  it("detects loneliness from common phrases", () => {
    const mood = inferMoodTag("I feel so lonely, like no one is here for me.");
    expect(mood).toBe("lonely");
  });

  it("detects stress and anxiety from work related text", () => {
    const mood = inferMoodTag("I am so stressed and anxious about these deadlines at work.");
    expect(mood === "stressed" || mood === "anxious").toBe(true);
  });

  it("returns neutral when no strong emotion is present", () => {
    const mood = inferMoodTag("I had lunch and then watched some TV.");
    expect(mood).toBe("neutral");
  });
});

describe("detectCrisis", () => {
  it("flags clear self-harm intent as crisis", () => {
    const result = detectCrisis("Sometimes I think I want to kill myself.");
    expect(result.isCrisis).toBe(true);
    expect(result.matchedPhrases.length).toBeGreaterThan(0);
  });

  it("does not flag non-crisis text", () => {
    const result = detectCrisis("I am just tired from work.");
    expect(result.isCrisis).toBe(false);
    expect(result.matchedPhrases).toHaveLength(0);
  });
});

