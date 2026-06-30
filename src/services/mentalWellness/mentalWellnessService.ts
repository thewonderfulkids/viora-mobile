import {
  createEmptyMentalSummary,
  deleteMoodEntry,
  getMentalSummary,
  getMoodEntriesByUser,
  saveMentalSummary,
  saveMoodEntry,
} from "../../repositories";
import {
  CopingAction,
  CopingSuggestion,
  MentalInsight,
  MentalMetric,
  MentalWellnessDashboard,
  MentalWellnessSummaryDoc,
  MoodEmotion,
  MoodEntryDoc,
  MoodEntryInput,
  MoodTimelineItem,
  MoodTone,
  MoodTrigger,
} from "../../types";

function nowIso() {
  return new Date().toISOString();
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Number(value || 0), min), max);
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toneFromScore(score: number): MoodTone {
  if (score >= 70) return "positive";
  if (score >= 45) return "neutral";
  return "warning";
}

function labelForEmotion(emotion: MoodEmotion | "unknown") {
  return emotion === "unknown" ? "Unknown" : emotion.replace(/_/g, " ");
}

function labelForTrigger(trigger: MoodTrigger | "unknown") {
  return trigger === "unknown" ? "Unknown" : trigger.replace(/_/g, " ");
}

function dominant<T extends string>(items: T[], fallback: T): T {
  if (items.length === 0) return fallback;
  const counts = items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as T;
}

function buildCheckInStreak(entries: MoodEntryDoc[]) {
  const dateKeys = new Set(entries.map((entry) => entry.dateKey));
  let streak = 0;
  const cursor = new Date(`${todayKey()}T00:00:00`);

  for (let index = 0; index < 30; index += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!dateKeys.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function buildSummary(userId: string, entries: MoodEntryDoc[], savedSummary: MentalWellnessSummaryDoc | null): MentalWellnessSummaryDoc {
  const dateKey = todayKey();
  const todayEntries = entries.filter((entry) => entry.dateKey === dateKey);
  const sourceEntries = todayEntries.length > 0 ? todayEntries : entries.slice(0, 7);

  if (sourceEntries.length === 0) {
    return savedSummary || createEmptyMentalSummary(userId, dateKey);
  }

  const moodScore = clamp(Math.round(average(sourceEntries.map((entry) => entry.moodLevel)) * 20), 0, 100);
  const stressScore = clamp(Math.round(100 - average(sourceEntries.map((entry) => entry.stressLevel)) * 10), 0, 100);
  const energyScore = clamp(Math.round(average(sourceEntries.map((entry) => entry.energyLevel)) * 10), 0, 100);
  const sleepSupport = clamp(Math.round(100 - average(sourceEntries.map((entry) => entry.sleepImpact)) * 7), 0, 100);
  const emotionalBalanceScore = clamp(Math.round(moodScore * 0.35 + stressScore * 0.3 + energyScore * 0.2 + sleepSupport * 0.15), 0, 100);
  const dominantEmotion = dominant(sourceEntries.flatMap((entry) => entry.emotions), "unknown" as MoodEmotion | "unknown");
  const dominantTrigger = dominant(sourceEntries.flatMap((entry) => entry.triggers), "unknown" as MoodTrigger | "unknown");
  const riskLevel = emotionalBalanceScore < 45 || stressScore < 35 ? "high" : emotionalBalanceScore < 68 ? "medium" : "low";
  const timestamp = nowIso();

  const aiSummary = riskLevel === "low"
    ? `Your emotional balance looks steady. ${labelForEmotion(dominantEmotion)} is the strongest signal today.`
    : riskLevel === "medium"
      ? `Your mood needs light support. ${labelForTrigger(dominantTrigger)} may be influencing your emotional balance.`
      : `High mental load detected. Start with breathing, water, a short walk or a calm reset before adding more tasks.`;

  return {
    id: `${userId}_${dateKey}`,
    userId,
    dateKey,
    moodScore,
    stressScore,
    energyScore,
    emotionalBalanceScore,
    checkInStreak: buildCheckInStreak(entries),
    riskLevel,
    dominantEmotion,
    dominantTrigger,
    aiSummary,
    createdAt: savedSummary?.createdAt || timestamp,
    updatedAt: timestamp,
    isDeleted: false,
  };
}

function buildMetrics(summary: MentalWellnessSummaryDoc): MentalMetric[] {
  return [
    {
      id: "mood",
      label: "Mood Score",
      value: `${summary.moodScore}%`,
      helper: `Dominant emotion: ${labelForEmotion(summary.dominantEmotion)}`,
      tone: toneFromScore(summary.moodScore),
    },
    {
      id: "stress",
      label: "Stress Safety",
      value: `${summary.stressScore}%`,
      helper: `Main trigger: ${labelForTrigger(summary.dominantTrigger)}`,
      tone: toneFromScore(summary.stressScore),
    },
    {
      id: "energy",
      label: "Energy",
      value: `${summary.energyScore}%`,
      helper: "Based on your latest check-ins",
      tone: toneFromScore(summary.energyScore),
    },
    {
      id: "streak",
      label: "Check-in Streak",
      value: `${summary.checkInStreak} day${summary.checkInStreak === 1 ? "" : "s"}`,
      helper: "Daily mood awareness streak",
      tone: summary.checkInStreak >= 3 ? "positive" : "neutral",
    },
  ];
}

function buildInsights(summary: MentalWellnessSummaryDoc, entries: MoodEntryDoc[]): MentalInsight[] {
  const insights: MentalInsight[] = [
    {
      id: "daily-summary",
      title: "AI Mental Wellness Summary",
      message: summary.aiSummary,
      tone: summary.riskLevel === "high" ? "warning" : summary.riskLevel === "low" ? "positive" : "neutral",
    },
  ];

  if (summary.dominantTrigger !== "unknown") {
    insights.push({
      id: "trigger-pattern",
      title: "Trigger Pattern",
      message: `${labelForTrigger(summary.dominantTrigger)} is appearing as a strong trigger. Viora will connect this with sleep, food timing and habits.`,
      tone: summary.riskLevel === "high" ? "warning" : "neutral",
    });
  }

  if (entries.some((entry) => entry.copingActions.includes("breathing"))) {
    insights.push({
      id: "breathing-support",
      title: "Breathing Support Logged",
      message: "Breathing is now part of your mental wellness pattern. Future voice commands can trigger this quickly.",
      tone: "positive",
    });
  }

  if (summary.energyScore < 45) {
    insights.push({
      id: "low-energy",
      title: "Low Energy Signal",
      message: "Energy is low. A lighter task plan, hydration, nutrition and sleep support can help today.",
      tone: "warning",
    });
  }

  if (entries.length === 0) {
    insights.push({
      id: "first-checkin",
      title: "Start With One Check-in",
      message: "Log how you feel right now. Even one check-in improves AI coaching context.",
      tone: "neutral",
    });
  }

  return insights;
}

function buildSuggestions(dateKey: string): CopingSuggestion[] {
  return [
    {
      id: "calm-reset",
      title: "2-Minute Calm Reset",
      description: "Use when stress feels high or focus feels scattered.",
      actionLabel: "Save calm check-in",
      recommendedAction: "breathing",
      suggestedMoodInput: {
        dateKey,
        moodLevel: 3,
        stressLevel: 5,
        energyLevel: 5,
        sleepImpact: 4,
        emotions: ["calm"],
        triggers: ["unknown"],
        copingActions: ["breathing"],
        note: "Used a short breathing reset.",
        source: "ai_suggestion",
      },
    },
    {
      id: "walk-release",
      title: "Short Walk Release",
      description: "Best when mood is low, energy is blocked or screen time is high.",
      actionLabel: "Save walk check-in",
      recommendedAction: "walk",
      suggestedMoodInput: {
        dateKey,
        moodLevel: 4,
        stressLevel: 4,
        energyLevel: 7,
        sleepImpact: 3,
        emotions: ["focused"],
        triggers: ["screen_time"],
        copingActions: ["walk", "water"],
        note: "Took a short walk and water break.",
        source: "ai_suggestion",
      },
    },
    {
      id: "journal-dump",
      title: "Journal Dump",
      description: "Useful when thoughts feel heavy or work/family triggers are active.",
      actionLabel: "Save journal check-in",
      recommendedAction: "journal",
      suggestedMoodInput: {
        dateKey,
        moodLevel: 3,
        stressLevel: 6,
        energyLevel: 5,
        sleepImpact: 5,
        emotions: ["overwhelmed"],
        triggers: ["work"],
        copingActions: ["journal"],
        note: "Used journaling to clear mental load.",
        source: "ai_suggestion",
      },
    },
  ];
}

function buildTimeline(entries: MoodEntryDoc[]): MoodTimelineItem[] {
  return entries.slice(0, 10).map((entry) => ({
    id: entry.id,
    title: `${entry.moodLevel}/5 mood • ${entry.stressLevel}/10 stress`,
    subtitle: entry.emotions.length > 0 ? `Emotions: ${entry.emotions.join(", ")}` : entry.aiReflection,
    time: entry.createdAt,
    tone: entry.stressLevel >= 7 ? "warning" : entry.moodLevel >= 4 ? "positive" : "neutral",
  }));
}

function weeklyAverage(entries: MoodEntryDoc[]) {
  const recent = entries.slice(0, 7);
  return Math.round(average(recent.map((entry) => entry.moodLevel * 20)));
}

function monthlyTrend(entries: MoodEntryDoc[]): MentalWellnessDashboard["monthlyTrend"] {
  if (entries.length < 4) return "stable";
  const recent = average(entries.slice(0, 3).map((entry) => entry.moodLevel));
  const older = average(entries.slice(3, 8).map((entry) => entry.moodLevel));
  if (recent > older + 0.4) return "improving";
  if (recent < older - 0.4) return "needs_attention";
  return "stable";
}

export async function getMentalWellnessDashboard(userId: string): Promise<MentalWellnessDashboard> {
  const dateKey = todayKey();
  const [entries, savedSummary] = await Promise.all([
    getMoodEntriesByUser(userId),
    getMentalSummary(userId, dateKey),
  ]);

  const summary = buildSummary(userId, entries, savedSummary);
  await saveMentalSummary(summary);

  const todayEntry = entries.find((entry) => entry.dateKey === dateKey) || null;
  const metrics = buildMetrics(summary);
  const insights = buildInsights(summary, entries);
  const suggestions = buildSuggestions(dateKey);
  const timeline = buildTimeline(entries);

  return {
    userId,
    dateKey,
    generatedAt: nowIso(),
    entries,
    todayEntry,
    summary,
    metrics,
    insights,
    suggestions,
    timeline,
    moodScore: summary.moodScore,
    stressScore: summary.stressScore,
    emotionalBalanceScore: summary.emotionalBalanceScore,
    weeklyAverageMoodScore: weeklyAverage(entries),
    monthlyTrend: monthlyTrend(entries),
    aiCoachContext: `Mental wellness: ${summary.emotionalBalanceScore}% balance, ${summary.riskLevel} risk, dominant emotion ${summary.dominantEmotion}.`,
    aiMemoryContext: `Remember mood trigger pattern: ${summary.dominantTrigger}. Check-in streak ${summary.checkInStreak} days.`,
    wellnessIntelligenceContext: `Mental wellness can influence sleep, hydration, nutrition and habit consistency. Current risk: ${summary.riskLevel}.`,
    notificationContext: summary.riskLevel === "high" ? "Send gentle calm reset reminder today." : "Use daily mood check-in reminder.",
    voiceCommandContext: "Voice-ready commands: log mood, start breathing, save stress check-in, open AI coach.",
  };
}

export async function createMoodCheckIn(input: MoodEntryInput): Promise<MoodEntryDoc> {
  return saveMoodEntry(input);
}

export async function applyCopingSuggestion(userId: string, suggestion: CopingSuggestion): Promise<MoodEntryDoc> {
  return saveMoodEntry({ ...suggestion.suggestedMoodInput, userId });
}

export async function removeMoodCheckIn(entryId: string): Promise<void> {
  return deleteMoodEntry(entryId);
}
