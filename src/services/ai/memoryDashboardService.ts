import {
  AIMemoryDashboard,
  AIMemoryInsight,
  AIMemoryRecommendation,
  AIMemoryRecord,
  AIMemoryStat,
  AIMemoryTimelineItem,
  ConversationSummary,
  MemoryImportance,
  MemorySource,
  UserWellnessProfile,
} from "../../types";
import {
  getActiveAIMemories,
  getLatestConversationSummaries,
  getWellnessProfile,
} from "./memoryService";

const IMPORTANT_WEIGHT: Record<MemoryImportance, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const SOURCE_LABELS: Record<MemorySource | "profile" | "system", string> = {
  conversation: "AI conversation",
  hydration: "Hydration",
  sleep: "Sleep",
  yoga: "Yoga",
  music: "Music",
  onboarding: "Onboarding",
  system: "Viora AI",
  profile: "Wellness profile",
};

function formatPercent(value: number) {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

function parseTime(value: string | null) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatDateLabel(value: string | null) {
  if (!value) return "Recently";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function sortMemoriesByRelevance(memories: AIMemoryRecord[]) {
  return [...memories].sort((a, b) => {
    const importanceDiff = IMPORTANT_WEIGHT[b.importance] - IMPORTANT_WEIGHT[a.importance];
    if (importanceDiff !== 0) return importanceDiff;

    const confidenceDiff = b.confidence - a.confidence;
    if (confidenceDiff !== 0) return confidenceDiff;

    return parseTime(b.updatedAt) - parseTime(a.updatedAt);
  });
}

function buildLearnedHabits(memories: AIMemoryRecord[]) {
  return sortMemoriesByRelevance(
    memories.filter((memory) => memory.category === "habit" || memory.source !== "conversation")
  ).slice(0, 8);
}

function buildWellnessPatterns(memories: AIMemoryRecord[]): AIMemoryInsight[] {
  const groups = memories.reduce<Record<string, AIMemoryRecord[]>>((acc, memory) => {
    const key = memory.source;
    acc[key] = [...(acc[key] ?? []), memory];
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([source, items]) => {
      const sorted = sortMemoriesByRelevance(items);
      const top = sorted[0];
      const confidence =
        items.reduce((total, item) => total + item.confidence, 0) / Math.max(items.length, 1);

      return {
        id: `pattern-${source}`,
        title: `${SOURCE_LABELS[source as MemorySource]} pattern`,
        description: top
          ? `${top.title}: ${top.summary}`
          : "Viora is still learning this pattern.",
        source: source as MemorySource,
        confidence,
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 6);
}

function buildWeeklyInsights(
  memories: AIMemoryRecord[],
  conversations: ConversationSummary[],
  profile: UserWellnessProfile | null
): AIMemoryInsight[] {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentMemories = memories.filter((memory) => parseTime(memory.updatedAt) >= sevenDaysAgo);
  const recentConversations = conversations.filter(
    (conversation) => parseTime(conversation.updatedAt) >= sevenDaysAgo
  );

  const insights: AIMemoryInsight[] = [];

  if (recentMemories.length > 0) {
    insights.push({
      id: "weekly-memory-growth",
      title: "Memory growth this week",
      description: `Viora updated ${recentMemories.length} wellness memory point${recentMemories.length === 1 ? "" : "s"} from your recent activity.`,
      source: "system",
      confidence: 0.86,
    });
  }

  if (recentConversations.length > 0) {
    const latest = recentConversations[0];
    insights.push({
      id: "weekly-conversation-theme",
      title: "Conversation theme",
      description: latest.keyTopics.length
        ? `Recent AI coaching topics include ${latest.keyTopics.slice(0, 3).join(", ")}.`
        : latest.summary,
      source: "conversation",
      confidence: 0.82,
    });
  }

  if (profile?.primaryGoal) {
    insights.push({
      id: "weekly-goal-alignment",
      title: "Goal alignment",
      description: `Your current wellness goal is ${profile.primaryGoal}. Recommendations are ranked around this goal.`,
      source: "profile",
      confidence: 0.9,
    });
  }

  const riskSignals = memories.filter((memory) => memory.category === "risk_signal");
  if (riskSignals.length > 0) {
    const topRisk = sortMemoriesByRelevance(riskSignals)[0];
    insights.push({
      id: "weekly-risk-signal",
      title: "Support signal",
      description: topRisk.summary,
      source: topRisk.source,
      confidence: topRisk.confidence,
    });
  }

  return insights.slice(0, 5);
}

function getRecommendationAction(source: MemorySource | "system") {
  if (source === "hydration") return "Log water";
  if (source === "sleep") return "Plan sleep";
  if (source === "yoga") return "Start yoga";
  if (source === "music") return "Start session";
  return "Open AI coach";
}

function buildRecommendations(memories: AIMemoryRecord[]): AIMemoryRecommendation[] {
  const priorityMemories = sortMemoriesByRelevance(
    memories.filter(
      (memory) =>
        memory.category === "goal" ||
        memory.category === "barrier" ||
        memory.category === "risk_signal" ||
        memory.importance === "high" ||
        memory.importance === "critical"
    )
  );

  const recommendations = priorityMemories.slice(0, 5).map((memory) => ({
    id: `recommendation-${memory.id}`,
    title: memory.category === "barrier" ? "Reduce this blocker" : memory.title,
    description: memory.summary,
    actionLabel: getRecommendationAction(memory.source),
    priority: memory.importance,
  }));

  if (recommendations.length > 0) return recommendations;

  return memories.slice(0, 3).map((memory) => ({
    id: `recommendation-${memory.id}`,
    title: `Build around ${memory.title}`,
    description: memory.summary,
    actionLabel: getRecommendationAction(memory.source),
    priority: memory.importance,
  }));
}

function buildTimeline(
  memories: AIMemoryRecord[],
  conversations: ConversationSummary[],
  profile: UserWellnessProfile | null
): AIMemoryTimelineItem[] {
  const memoryItems: AIMemoryTimelineItem[] = memories.map((memory) => ({
    id: `memory-${memory.id}`,
    title: memory.title,
    description: memory.summary,
    dateLabel: formatDateLabel(memory.updatedAt),
    source: memory.source,
    importance: memory.importance,
  }));

  const conversationItems: AIMemoryTimelineItem[] = conversations.map((conversation) => ({
    id: `conversation-${conversation.id}`,
    title: "Conversation summary",
    description: conversation.summary,
    dateLabel: formatDateLabel(conversation.updatedAt),
    source: "conversation",
    importance: conversation.riskSignal ? "high" : "medium",
  }));

  const profileItem: AIMemoryTimelineItem[] = profile?.lastMemoryUpdatedAt
    ? [
        {
          id: "profile-last-update",
          title: "Profile learning updated",
          description: profile.primaryGoal
            ? `Viora aligned memory with your ${profile.primaryGoal} goal.`
            : "Viora refreshed your wellness profile context.",
          dateLabel: formatDateLabel(profile.lastMemoryUpdatedAt),
          source: "profile",
          importance: "medium",
        },
      ]
    : [];

  return [...memoryItems, ...conversationItems, ...profileItem]
    .sort((a, b) => {
      const sourceA = a.id.startsWith("memory-")
        ? memories.find((item) => `memory-${item.id}` === a.id)?.updatedAt ?? null
        : conversations.find((item) => `conversation-${item.id}` === a.id)?.updatedAt ?? profile?.lastMemoryUpdatedAt ?? null;
      const sourceB = b.id.startsWith("memory-")
        ? memories.find((item) => `memory-${item.id}` === b.id)?.updatedAt ?? null
        : conversations.find((item) => `conversation-${item.id}` === b.id)?.updatedAt ?? profile?.lastMemoryUpdatedAt ?? null;

      return parseTime(sourceB) - parseTime(sourceA);
    })
    .slice(0, 12);
}

function buildStatistics(memories: AIMemoryRecord[], conversations: ConversationSummary[]): AIMemoryStat[] {
  const confidenceAverage =
    memories.reduce((total, memory) => total + memory.confidence, 0) / Math.max(memories.length, 1);
  const activeSources = new Set(memories.map((memory) => memory.source));
  const highPriority = memories.filter(
    (memory) => memory.importance === "high" || memory.importance === "critical"
  ).length;
  const usageTotal = memories.reduce((total, memory) => total + memory.usageCount, 0);

  return [
    {
      label: "Active memories",
      value: String(memories.length),
      helper: "Learned wellness signals",
    },
    {
      label: "Confidence",
      value: formatPercent(confidenceAverage),
      helper: "Average AI certainty",
    },
    {
      label: "Sources",
      value: String(activeSources.size),
      helper: "Wellness channels learned",
    },
    {
      label: "AI chats",
      value: String(conversations.length),
      helper: "Recent summaries saved",
    },
    {
      label: "Priority",
      value: String(highPriority),
      helper: "High-signal memories",
    },
    {
      label: "Used",
      value: String(usageTotal),
      helper: "Times memory supported AI",
    },
  ];
}

export async function getAIMemoryDashboard(userId: string): Promise<AIMemoryDashboard> {
  if (!userId) {
    throw new Error("User is required to load AI memory dashboard.");
  }

  const [memories, conversations, profile] = await Promise.all([
    getActiveAIMemories(userId, 30),
    getLatestConversationSummaries(userId, 10),
    getWellnessProfile(userId),
  ]);

  const sortedMemories = sortMemoriesByRelevance(memories);
  const confidenceAverage =
    sortedMemories.reduce((total, memory) => total + memory.confidence, 0) /
    Math.max(sortedMemories.length, 1);
  const highPriorityCount = sortedMemories.filter(
    (memory) => memory.importance === "high" || memory.importance === "critical"
  ).length;

  return {
    userId,
    generatedAt: new Date().toISOString(),
    wellnessProfile: profile,
    learnedHabits: buildLearnedHabits(sortedMemories),
    wellnessPatterns: buildWellnessPatterns(sortedMemories),
    conversationMemories: conversations,
    weeklyInsights: buildWeeklyInsights(sortedMemories, conversations, profile),
    recommendations: buildRecommendations(sortedMemories),
    timeline: buildTimeline(sortedMemories, conversations, profile),
    statistics: buildStatistics(sortedMemories, conversations),
    memoryCount: sortedMemories.length,
    confidenceAverage,
    highPriorityCount,
  };
}
