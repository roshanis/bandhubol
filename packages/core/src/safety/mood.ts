import type { MoodTag } from "../types";

export interface CrisisDetectionResult {
  isCrisis: boolean;
  matchedPhrases: string[];
}

const MOOD_KEYWORDS: Record<MoodTag, string[]> = {
  lonely: ["lonely", "alone", "no one", "nobody cares"],
  stressed: ["stressed", "overwhelmed", "burnt out", "pressure", "tension"],
  sad: ["sad", "down", "depressed", "heartbroken", "crying", "cry"],
  anxious: ["anxious", "anxiety", "nervous", "worried", "panic"],
  neutral: [],
  hopeful: ["hopeful", "optimistic", "excited", "looking forward"],
  angry: ["angry", "furious", "mad", "pissed", "rage"]
};

const CRISIS_PHRASES: string[] = [
  "kill myself",
  "killing myself",
  "end my life",
  "ending my life",
  "suicide",
  "suicidal",
  "self harm",
  "self-harm",
  "cut myself",
  "cutting myself",
  "i don't want to live",
  "dont want to live",
  "don't want to live",
  "no reason to live"
];

export function inferMoodTag(text: string): MoodTag {
  const lower = text.toLowerCase();

  const crisis = detectCrisis(lower);
  if (crisis.isCrisis) {
    return "sad";
  }

  const scores: Record<MoodTag, number> = {
    lonely: 0,
    stressed: 0,
    sad: 0,
    anxious: 0,
    neutral: 0,
    hopeful: 0,
    angry: 0
  };

  (Object.keys(MOOD_KEYWORDS) as MoodTag[]).forEach((mood) => {
    for (const keyword of MOOD_KEYWORDS[mood]) {
      if (lower.includes(keyword)) {
        scores[mood] += 1;
      }
    }
  });

  let bestMood: MoodTag = "neutral";
  let bestScore = 0;

  (Object.keys(scores) as MoodTag[]).forEach((mood) => {
    if (scores[mood] > bestScore) {
      bestScore = scores[mood];
      bestMood = mood;
    }
  });

  return bestScore === 0 ? "neutral" : bestMood;
}

export function detectCrisis(text: string): CrisisDetectionResult {
  const lower = text.toLowerCase();
  const matched: string[] = [];

  for (const phrase of CRISIS_PHRASES) {
    if (lower.includes(phrase)) {
      matched.push(phrase);
    }
  }

  return {
    isCrisis: matched.length > 0,
    matchedPhrases: matched
  };
}

