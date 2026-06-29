import { getTodayKey } from "../../firebase/firestoreHelpers";
import { DailyStatsDoc } from "../../firebase/firestoreTypes";
import { getRecentDailyStats, saveWellnessIntelligenceSnapshot } from "../../repositories/wellnessIntelligenceRepository";
import {
  AIMemoryRecord,
  ConversationSummary,
  UserWellnessProfile,
} from "../../types/aiMemory";
import {
  WellnessFocusArea,
  WellnessInsight,
  WellnessIntelligence,
  WellnessIntelligenceDashboard,
  WellnessLearningStatistic,
  WellnessMetricSnapshot,
  WellnessRecommendation,
  WellnessRiskSignal,
  WellnessSignalCategory,
  WellnessStatus,
  WellnessTimelineEvent,
  WellnessTrend,
} from "../../types/wellnessIntelligence";
import { DashboardData } from "../dashboardService";

export type BuildWellnessIntelligenceInput = {
  dashboard: DashboardData;
  profile: UserWellnessProfile | null;
  memories: AIMemoryRecord[];
  summaries: ConversationSummary[];
};

export type BuildWellnessIntelligenceDashboardInput = BuildWellnessIntelligenceInput & {
  userId: string;
  persistSnapshot?: boolean;
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function percent(value: number) {
  return `${clampScore(value)}%`;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function calculateScore(stats: DailyStatsDoc) {
  let score = 30;
  if (stats.waterMl >= 1500) score += 20;
  if (stats.sleepMinutes >= 360) score += 20;
  if (stats.yogaMinutes >= 10) score += 15;
  if (stats.musicMinutes >= 10) score += 15;
  return clampScore(score);
}

function getHydrationStatus(waterMl: number): WellnessStatus {
  if (waterMl >= 2500) return "excellent";
  if (waterMl >= 1800) return "good";
  if (waterMl >= 1000) return "needs_attention";
  return "critical";
}

function getSleepStatus(sleepMinutes: number): WellnessStatus {
  const hours = sleepMinutes / 60;
  if (hours >= 7 && hours <= 9) return "excellent";
  if (hours >= 6 && hours < 10) return "good";
  if (hours >= 4) return "needs_attention";
  return "critical";
}

function getYogaStatus(yogaMinutes: number): WellnessStatus {
  if (yogaMinutes >= 30) return "excellent";
  if (yogaMinutes >= 15) return "good";
  if (yogaMinutes > 0) return "needs_attention";
  return "unknown";
}

function getMusicStatus(musicMinutes: number): WellnessStatus {
  if (musicMinutes >= 20) return "excellent";
  if (musicMinutes >= 10) return "good";
  if (musicMinutes > 0) return "needs_attention";
  return "unknown";
}

function getStressStatus({
  dashboardStress,
  memories,
  summaries,
}: {
  dashboardStress: string;
  memories: AIMemoryRecord[];
  summaries: ConversationSummary[];
}): WellnessStatus {
  const combinedText = [
    dashboardStress,
    ...memories.map((memory) => `${memory.title} ${memory.summary}`),
    ...summaries.map((summary) => `${summary.summary} ${summary.riskSignal ?? ""}`),
  ]
    .join(" ")
    .toLowerCase();

  if (
    combinedText.includes("panic") ||
    combinedText.includes("critical") ||
    combinedText.includes("too much stress")
  ) {
    return "critical";
  }

  if (
    combinedText.includes("stress") ||
    combinedText.includes("anxiety") ||
    combinedText.includes("work pressure")
  ) {
    return "needs_attention";
  }

  if (dashboardStress.toLowerCase().includes("low")) return "excellent";
  if (dashboardStress.toLowerCase().includes("moderate")) return "good";

  return "unknown";
}

function getRecommendedFocus({
  hydrationStatus,
  sleepStatus,
  stressStatus,
  yogaStatus,
}: {
  hydrationStatus: WellnessStatus;
  sleepStatus: WellnessStatus;
  stressStatus: WellnessStatus;
  yogaStatus: WellnessStatus;
}): WellnessFocusArea {
  if (stressStatus === "critical" || stressStatus === "needs_attention") return "stress";
  if (sleepStatus === "critical" || sleepStatus === "needs_attention") return "sleep";
  if (hydrationStatus === "critical" || hydrationStatus === "needs_attention") return "hydration";
  if (yogaStatus === "unknown" || yogaStatus === "needs_attention") return "yoga";
  return "balanced_routine";
}

function compareTrend(current: number, previous: number): WellnessTrend {
  if (!previous) return "unknown";
  if (current >= previous + 8) return "improving";
  if (current <= previous - 8) return "declining";
  return "stable";
}

function getOverallTrend({ dashboard, history }: { dashboard: DashboardData; history: DailyStatsDoc[] }): WellnessTrend {
  const previousScores = history.slice(1, 8).map(calculateScore);
  if (!previousScores.length) {
    if (dashboard.wellnessScore >= 75) return "improving";
    if (dashboard.wellnessScore >= 50) return "stable";
    if (dashboard.wellnessScore > 0) return "declining";
    return "unknown";
  }
  return compareTrend(dashboard.wellnessScore, average(previousScores));
}

function statusScore(status: WellnessStatus) {
  if (status === "excellent") return 100;
  if (status === "good") return 78;
  if (status === "needs_attention") return 48;
  if (status === "critical") return 20;
  return 35;
}

function buildAchievements({
  dashboard,
  hydrationStatus,
  sleepStatus,
  yogaStatus,
  musicStatus,
}: {
  dashboard: DashboardData;
  hydrationStatus: WellnessStatus;
  sleepStatus: WellnessStatus;
  yogaStatus: WellnessStatus;
  musicStatus: WellnessStatus;
}) {
  const achievements: string[] = [];
  if (dashboard.wellnessScore >= 75) achievements.push("Your wellness score is in a strong range today.");
  if (hydrationStatus === "excellent" || hydrationStatus === "good") achievements.push("Your hydration looks healthy today.");
  if (sleepStatus === "excellent" || sleepStatus === "good") achievements.push("Your sleep duration is supporting recovery.");
  if (yogaStatus === "excellent" || yogaStatus === "good") achievements.push("Your yoga activity is helping build consistency.");
  if (musicStatus === "excellent" || musicStatus === "good") achievements.push("Music therapy is adding a calming balance to your day.");
  return achievements.slice(0, 4);
}

function buildRiskSignals({
  hydrationStatus,
  sleepStatus,
  stressStatus,
  memories,
}: {
  hydrationStatus: WellnessStatus;
  sleepStatus: WellnessStatus;
  stressStatus: WellnessStatus;
  memories: AIMemoryRecord[];
}) {
  const risks: string[] = [];
  if (hydrationStatus === "critical") risks.push("Hydration appears very low today.");
  if (sleepStatus === "critical") risks.push("Sleep duration may be too low for healthy recovery.");
  if (stressStatus === "critical") risks.push("Stress or anxiety signals need careful attention.");
  else if (stressStatus === "needs_attention") risks.push("Stress patterns may need extra support today.");

  const riskMemory = memories.find((memory) => memory.category === "risk_signal");
  if (riskMemory) risks.push(riskMemory.title);

  return Array.from(new Set(risks)).slice(0, 4);
}

function buildCoachInsight({ overallTrend, recommendedFocus }: { overallTrend: WellnessTrend; recommendedFocus: WellnessFocusArea }) {
  const focus = recommendedFocus.replace("_", " ");
  if (overallTrend === "improving") return `You are showing positive momentum. Today, the best focus area is ${focus}.`;
  if (overallTrend === "declining") return `Your wellness may need extra care today. Start with ${focus} and keep the plan simple.`;
  return `Your wellness looks steady. A focused improvement in ${focus} can help build better consistency.`;
}

export function buildWellnessIntelligence({
  dashboard,
  profile,
  memories,
  summaries,
}: BuildWellnessIntelligenceInput): WellnessIntelligence {
  const stats = dashboard.todayStats;
  const hydrationStatus = getHydrationStatus(stats.waterMl);
  const sleepStatus = getSleepStatus(stats.sleepMinutes);
  const yogaStatus = getYogaStatus(stats.yogaMinutes);
  const musicStatus = getMusicStatus(stats.musicMinutes);
  const stressStatus = getStressStatus({
    dashboardStress: profile?.stressLevel ?? dashboard.user?.stressLevel ?? "Moderate",
    memories,
    summaries,
  });

  const recommendedFocus = getRecommendedFocus({ hydrationStatus, sleepStatus, stressStatus, yogaStatus });
  const overallTrend = dashboard.wellnessScore >= 75 ? "improving" : dashboard.wellnessScore >= 50 ? "stable" : "declining";

  return {
    overallTrend,
    hydrationStatus,
    sleepStatus,
    stressStatus,
    yogaStatus,
    musicStatus,
    recommendedFocus,
    achievements: buildAchievements({ dashboard, hydrationStatus, sleepStatus, yogaStatus, musicStatus }),
    riskSignals: buildRiskSignals({ hydrationStatus, sleepStatus, stressStatus, memories }),
    coachInsight: buildCoachInsight({ overallTrend, recommendedFocus }),
    generatedAt: new Date().toISOString(),
  };
}

function buildMetric({
  key,
  label,
  value,
  goal,
  unit,
  status,
  historyValues,
  helperText,
}: {
  key: WellnessMetricSnapshot["key"];
  label: string;
  value: number;
  goal: number;
  unit: string;
  status: WellnessStatus;
  historyValues: number[];
  helperText: string;
}): WellnessMetricSnapshot {
  return {
    key,
    label,
    value,
    goal,
    unit,
    status,
    trend: compareTrend(value, average(historyValues)),
    helperText,
  };
}

function buildInsights({
  core,
  history,
  memories,
  summaries,
}: {
  core: WellnessIntelligence;
  history: DailyStatsDoc[];
  memories: AIMemoryRecord[];
  summaries: ConversationSummary[];
}): WellnessInsight[] {
  const insights: WellnessInsight[] = [];
  const activeDays = history.filter((item) => calculateScore(item) > 30).length;

  insights.push({
    id: "daily-index",
    category: "routine",
    title: "Daily wellness index generated",
    message: core.coachInsight,
    severity: core.overallTrend === "declining" ? "watch" : "positive",
    confidence: history.length >= 3 ? 0.86 : 0.68,
  });

  if (activeDays >= 4) {
    insights.push({
      id: "consistency",
      category: "routine",
      title: "Consistency pattern detected",
      message: `Viora found activity across ${activeDays} recent day${activeDays === 1 ? "" : "s"}.`,
      severity: "positive",
      confidence: 0.82,
    });
  }

  if (memories.length > 0) {
    insights.push({
      id: "memory-backed",
      category: "ai_memory",
      title: "AI memory added context",
      message: `${memories.length} saved memory signal${memories.length === 1 ? "" : "s"} influenced today's recommendation priority.`,
      severity: "neutral",
      confidence: 0.8,
    });
  }

  const latestSummary = summaries[0];
  if (latestSummary) {
    insights.push({
      id: "conversation-summary",
      category: "ai_memory",
      title: "Conversation memory included",
      message: latestSummary.summary,
      severity: latestSummary.riskSignal ? "watch" : "neutral",
      confidence: 0.74,
    });
  }

  return insights.slice(0, 5);
}

function buildRisks(core: WellnessIntelligence): WellnessRiskSignal[] {
  return core.riskSignals.map((signal, index) => ({
    id: `risk-${index}`,
    title: signal,
    message: index === 0 ? "Keep this area light and manageable today." : "Viora will use this signal while ranking recommendations.",
    severity: signal.toLowerCase().includes("very") || signal.toLowerCase().includes("too low") ? "risk" : "watch",
    category: signal.toLowerCase().includes("sleep") ? "sleep" : signal.toLowerCase().includes("stress") ? "stress" : "hydration",
  }));
}

function buildRecommendations(core: WellnessIntelligence, dashboard: DashboardData): WellnessRecommendation[] {
  const stats = dashboard.todayStats;
  const items: WellnessRecommendation[] = [];

  items.push({
    id: "primary-focus",
    focusArea: core.recommendedFocus,
    title: `Focus on ${core.recommendedFocus.replace("_", " ")}`,
    action: core.recommendedFocus === "hydration" ? "Drink 300 ml water now and repeat after 60 minutes." : core.recommendedFocus === "sleep" ? "Plan a lighter wind-down window before bed." : core.recommendedFocus === "stress" ? "Take a 3-minute breathing pause and avoid stacking heavy tasks." : "Complete one short wellness activity today.",
    reason: "This is the highest-impact area based on today's index and memory signals.",
    priority: 1,
    premiumReady: true,
    notificationReady: true,
  });

  if (stats.yogaMinutes < 10) {
    items.push({
      id: "yoga-boost",
      focusArea: "yoga",
      title: "Add a short movement reset",
      action: "Do a 10-minute gentle yoga session.",
      reason: "Movement improves the daily score and supports stress balance.",
      priority: 2,
      premiumReady: false,
      notificationReady: true,
    });
  }

  if (stats.musicMinutes < 10) {
    items.push({
      id: "music-calm",
      focusArea: "music",
      title: "Use music therapy for recovery",
      action: "Play one calming session for at least 10 minutes.",
      reason: "Recovery routines help keep the day balanced.",
      priority: 3,
      premiumReady: false,
      notificationReady: true,
    });
  }

  return items.slice(0, 4);
}

function buildTimeline(history: DailyStatsDoc[]): WellnessTimelineEvent[] {
  return history.slice(0, 7).map((item) => {
    const score = calculateScore(item);
    const category: WellnessSignalCategory = item.waterMl < 1000 ? "hydration" : item.sleepMinutes < 300 ? "sleep" : item.yogaMinutes > 0 ? "activity" : "routine";

    return {
      id: `timeline-${item.dateKey}`,
      title: `Wellness score ${score}`,
      description: `${item.waterMl} ml water · ${Math.round(item.sleepMinutes / 60)}h sleep · ${item.yogaMinutes}m yoga`,
      dateKey: item.dateKey,
      category,
      scoreImpact: score - 50,
    };
  });
}

function buildStatistics({
  dashboard,
  history,
  memories,
  recommendations,
}: {
  dashboard: WellnessIntelligenceDashboard;
  history: DailyStatsDoc[];
  memories: AIMemoryRecord[];
  recommendations: WellnessRecommendation[];
}): WellnessLearningStatistic[] {
  return [
    { label: "Daily Index", value: String(dashboard.dailyWellnessIndex), helper: "Current wellness score" },
    { label: "Weekly Avg", value: String(dashboard.weeklyAverageScore), helper: "Recent dailyStats average" },
    { label: "Consistency", value: percent(dashboard.consistencyScore), helper: "Active days in recent history" },
    { label: "AI Signals", value: String(memories.length), helper: "Memory records used" },
    { label: "Actions", value: String(recommendations.length), helper: "Ranked next steps" },
  ];
}

function riskLevelFromRisks(risks: WellnessRiskSignal[]) {
  if (risks.some((risk) => risk.severity === "risk")) return "high" as const;
  if (risks.length > 0) return "medium" as const;
  return "low" as const;
}

function buildSummary(core: WellnessIntelligence, index: number, weeklyAverage: number) {
  const direction = index >= weeklyAverage ? "ahead of" : "below";
  return `Today's wellness index is ${index}, ${direction} the recent average of ${weeklyAverage}. ${core.coachInsight}`;
}

export async function buildWellnessIntelligenceDashboard({
  userId,
  dashboard,
  profile,
  memories,
  summaries,
  persistSnapshot = true,
}: BuildWellnessIntelligenceDashboardInput): Promise<WellnessIntelligenceDashboard> {
  const history = await getRecentDailyStats({ userId, maxResults: 14 });
  const historyWithToday = history.some((item) => item.dateKey === dashboard.todayStats.dateKey)
    ? history
    : [dashboard.todayStats, ...history];

  const core = buildWellnessIntelligence({ dashboard, profile, memories, summaries });
  const currentIndex = clampScore(
    dashboard.wellnessScore * 0.62 +
      statusScore(core.sleepStatus) * 0.16 +
      statusScore(core.hydrationStatus) * 0.12 +
      statusScore(core.stressStatus) * 0.1
  );
  const weeklyScores = historyWithToday.slice(0, 7).map(calculateScore);
  const weeklyAverageScore = clampScore(average(weeklyScores));
  const activeDays = historyWithToday.slice(0, 7).filter((item) => calculateScore(item) > 30).length;
  const consistencyScore = clampScore((activeDays / 7) * 100);

  const previous = historyWithToday.slice(1, 8);
  const metrics: WellnessMetricSnapshot[] = [
    buildMetric({ key: "overall", label: "Daily Index", value: currentIndex, goal: 100, unit: "score", status: currentIndex >= 75 ? "excellent" : currentIndex >= 55 ? "good" : currentIndex >= 35 ? "needs_attention" : "critical", historyValues: previous.map(calculateScore), helperText: "Composite score from activity, recovery and AI memory signals." }),
    buildMetric({ key: "hydration", label: "Hydration", value: dashboard.todayStats.waterMl, goal: dashboard.user?.waterGoalMl || 2500, unit: "ml", status: core.hydrationStatus, historyValues: previous.map((item) => item.waterMl), helperText: "Tracks water progress against your daily goal." }),
    buildMetric({ key: "sleep", label: "Sleep", value: Math.round(dashboard.todayStats.sleepMinutes / 60), goal: 8, unit: "hours", status: core.sleepStatus, historyValues: previous.map((item) => Math.round(item.sleepMinutes / 60)), helperText: "Recovery signal based on logged sleep duration." }),
    buildMetric({ key: "yoga", label: "Yoga", value: dashboard.todayStats.yogaMinutes, goal: 30, unit: "min", status: core.yogaStatus, historyValues: previous.map((item) => item.yogaMinutes), helperText: "Movement consistency for flexibility and calm." }),
    buildMetric({ key: "music", label: "Music Therapy", value: dashboard.todayStats.musicMinutes, goal: 20, unit: "min", status: core.musicStatus, historyValues: previous.map((item) => item.musicMinutes), helperText: "Recovery support through calming audio sessions." }),
  ];

  const risks = buildRisks(core);
  const recommendations = buildRecommendations(core, dashboard);

    const coreIntelligence = {
    ...core,
    overallTrend: getOverallTrend({ dashboard, history: historyWithToday }),
  };

  const partialDashboard = {
    ...coreIntelligence,
    dailyWellnessIndex: currentIndex,
    weeklyAverageScore,
    consistencyScore,
    riskLevel: riskLevelFromRisks(risks),
    generatedAt: new Date().toISOString(),
    summary: buildSummary(coreIntelligence, currentIndex, weeklyAverageScore),
    primaryFocus: coreIntelligence.recommendedFocus,
    coreIntelligence,
    metrics,
    trends: metrics,
    insights: buildInsights({ core: coreIntelligence, history: historyWithToday, memories, summaries }),
    risks,
    recommendations,
    timeline: buildTimeline(historyWithToday),
    statistics: [] as WellnessLearningStatistic[],
  } satisfies WellnessIntelligenceDashboard;

  const completeDashboard: WellnessIntelligenceDashboard = {
    ...partialDashboard,
    statistics: buildStatistics({ dashboard: partialDashboard, history: historyWithToday, memories, recommendations }),
  };

  if (persistSnapshot) {
    await saveWellnessIntelligenceSnapshot({
      userId,
      dateKey: dashboard.todayStats.dateKey || getTodayKey(),
      dashboard: completeDashboard,
    });
  }

  return completeDashboard;
}
