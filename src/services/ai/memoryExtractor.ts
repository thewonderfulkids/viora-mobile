import {
    CreateMemoryInput,
    MemoryImportance,
    MemorySource,
    WellnessMemoryCategory,
} from "../../types";

type ExtractMemoryInput = {
  userId: string;
  userMessage: string;
  assistantMessage?: string;
};

type MemoryPattern = {
  category: WellnessMemoryCategory;
  source: MemorySource;
  importance: MemoryImportance;
  tags: string[];
  keywords: string[];
  title: string;
};

const MEMORY_PATTERNS: MemoryPattern[] = [
  {
    category: "goal",
    source: "conversation",
    importance: "high",
    tags: ["goal", "fitness"],
    keywords: ["lose weight", "weight loss", "fat loss", "reduce weight"],
    title: "Weight loss goal",
  },
  {
    category: "goal",
    source: "conversation",
    importance: "high",
    tags: ["goal", "sleep"],
    keywords: ["sleep better", "improve sleep", "sleep schedule"],
    title: "Sleep improvement goal",
  },
  {
    category: "habit",
    source: "conversation",
    importance: "medium",
    tags: ["habit", "sleep"],
    keywords: ["sleep late", "sleep at 2", "sleep at 3", "late night"],
    title: "Late sleep habit",
  },
  {
    category: "habit",
    source: "conversation",
    importance: "medium",
    tags: ["habit", "hydration"],
    keywords: ["drink less water", "forget water", "less water"],
    title: "Low hydration habit",
  },
  {
    category: "risk_signal",
    source: "conversation",
    importance: "critical",
    tags: ["stress", "anxiety", "mental-wellness"],
    keywords: ["anxiety", "panic", "very stressed", "too much stress"],
    title: "Stress or anxiety signal",
  },
  {
    category: "preference",
    source: "conversation",
    importance: "low",
    tags: ["preference", "music"],
    keywords: ["calm music", "meditation music", "relaxing music"],
    title: "Music therapy preference",
  },
  {
    category: "barrier",
    source: "conversation",
    importance: "medium",
    tags: ["barrier", "routine"],
    keywords: ["no time", "busy schedule", "office work", "work pressure"],
    title: "Routine consistency barrier",
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function getConfidence(text: string, keywords: string[]) {
  const matched = keywords.filter((keyword) => text.includes(keyword)).length;

  if (matched >= 2) return 0.92;
  if (matched === 1) return 0.82;

  return 0.65;
}

function buildMemorySummary(pattern: MemoryPattern, userMessage: string) {
  return `User mentioned: "${userMessage.trim().slice(
    0,
    220
  )}". This may indicate ${pattern.title.toLowerCase()}.`;
}

export function extractMemoriesFromConversation({
  userId,
  userMessage,
}: ExtractMemoryInput): CreateMemoryInput[] {
  const normalized = normalizeText(userMessage);

  if (!userId || !normalized) return [];

  const memories: CreateMemoryInput[] = [];

  for (const pattern of MEMORY_PATTERNS) {
    const matched = pattern.keywords.some((keyword) =>
      normalized.includes(keyword)
    );

    if (!matched) continue;

    memories.push({
      userId,
      category: pattern.category,
      source: pattern.source,
      title: pattern.title,
      summary: buildMemorySummary(pattern, userMessage),
      importance: pattern.importance,
      confidence: getConfidence(normalized, pattern.keywords),
      tags: pattern.tags,
    });
  }

  return memories.slice(0, 3);
}