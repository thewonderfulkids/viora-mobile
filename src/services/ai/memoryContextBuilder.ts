import {
    getRecentConversationSummaries,
    getRelevantMemories,
    getUserWellnessProfile,
} from "../../repositories";
import {
    AIMemoryRecord,
    ConversationSummary,
    UserWellnessProfile,
} from "../../types";
import { rankMemories } from "./memoryRanking";

type BuildMemoryContextInput = {
  userId: string;
  maxMemories?: number;
  maxSummaries?: number;
};

export type AIMemoryContext = {
  profile: UserWellnessProfile | null;
  memories: AIMemoryRecord[];
  recentSummaries: ConversationSummary[];
  contextText: string;
};

function formatProfile(profile: UserWellnessProfile | null) {
  if (!profile) return "No wellness profile available yet.";

  return [
    `Name: ${profile.displayName || "Unknown"}`,
    `Primary Goal: ${profile.primaryGoal || "Not set"}`,
    `Stress Level: ${profile.stressLevel || "Not set"}`,
    `Preferred Language: ${profile.preferredLanguage || "en"}`,
    `Hydration Goal: ${profile.hydrationGoalMl ?? "Not set"} ml`,
    `Sleep Goal: ${profile.sleepGoalHours ?? "Not set"} hours`,
    `Yoga Goal: ${profile.yogaGoalMinutes ?? "Not set"} minutes`,
    `Music Preference: ${profile.musicPreference || "Not set"}`,
  ].join("\n");
}

function formatMemories(memories: AIMemoryRecord[]) {
  if (memories.length === 0) return "No active memories available yet.";

  return memories
    .map((memory, index) => {
      return `${index + 1}. [${memory.importance}] ${memory.title}: ${
        memory.summary
      }`;
    })
    .join("\n");
}

function formatSummaries(summaries: ConversationSummary[]) {
  if (summaries.length === 0) return "No recent conversation summaries yet.";

  return summaries
    .map((summary, index) => {
      return `${index + 1}. ${summary.summary}`;
    })
    .join("\n");
}

function createContextText({
  profile,
  memories,
  recentSummaries,
}: {
  profile: UserWellnessProfile | null;
  memories: AIMemoryRecord[];
  recentSummaries: ConversationSummary[];
}) {
  return [
    "USER WELLNESS PROFILE",
    formatProfile(profile),
    "",
    "IMPORTANT USER MEMORIES",
    formatMemories(memories),
    "",
    "RECENT CONVERSATION SUMMARIES",
    formatSummaries(recentSummaries),
  ].join("\n");
}

export async function buildAIMemoryContext({
  userId,
  maxMemories = 8,
  maxSummaries = 3,
}: BuildMemoryContextInput): Promise<AIMemoryContext> {
  if (!userId) {
    return {
      profile: null,
      memories: [],
      recentSummaries: [],
      contextText: "No authenticated user memory context available.",
    };
  }

  try {
    const [profile, memories, recentSummaries] = await Promise.all([
      getUserWellnessProfile(userId),
      getRelevantMemories(userId, { maxResults: maxMemories }),
      getRecentConversationSummaries(userId, maxSummaries),
    ]);

    const rankedMemories = rankMemories(memories).slice(0, maxMemories);

    return {
    profile,
    memories: rankedMemories,
    recentSummaries,
    contextText: createContextText({
        profile,
        memories: rankedMemories,
        recentSummaries,
    }),
   };
  } catch (error) {
    console.warn("AI memory context unavailable:", error);

    return {
      profile: null,
      memories: [],
      recentSummaries: [],
      contextText:
        "Long-term memory is temporarily unavailable. Use today's dashboard only.",
    };
  }
}