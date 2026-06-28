import {
    AIMemoryRecord,
    ConversationSummary,
    UserWellnessProfile,
} from "../../types/aiMemory";
import {
    WellnessFocusArea,
    WellnessIntelligence,
    WellnessStatus,
    WellnessTrend,
} from "../../types/wellnessIntelligence";
import { DashboardData } from "../dashboardService";

type BuildWellnessIntelligenceInput = {
  dashboard: DashboardData;
  profile: UserWellnessProfile | null;
  memories: AIMemoryRecord[];
  summaries: ConversationSummary[];
};

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
  if (stressStatus === "critical" || stressStatus === "needs_attention") {
    return "stress";
  }

  if (sleepStatus === "critical" || sleepStatus === "needs_attention") {
    return "sleep";
  }

  if (
    hydrationStatus === "critical" ||
    hydrationStatus === "needs_attention"
  ) {
    return "hydration";
  }

  if (yogaStatus === "unknown" || yogaStatus === "needs_attention") {
    return "yoga";
  }

  return "balanced_routine";
}

function getOverallTrend({
  dashboard,
  memories,
}: {
  dashboard: DashboardData;
  memories: AIMemoryRecord[];
}): WellnessTrend {
  const score = dashboard.wellnessScore;

  const hasProgressMemory = memories.some(
    (memory) => memory.category === "progress"
  );

  if (score >= 75 || hasProgressMemory) return "improving";
  if (score >= 50) return "stable";
  if (score > 0) return "declining";

  return "unknown";
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

  if (dashboard.wellnessScore >= 75) {
    achievements.push("Your wellness score is in a strong range today.");
  }

  if (hydrationStatus === "excellent" || hydrationStatus === "good") {
    achievements.push("Your hydration looks healthy today.");
  }

  if (sleepStatus === "excellent" || sleepStatus === "good") {
    achievements.push("Your sleep duration is supporting recovery.");
  }

  if (yogaStatus === "excellent" || yogaStatus === "good") {
    achievements.push("Your yoga activity is helping build consistency.");
  }

  if (musicStatus === "excellent" || musicStatus === "good") {
    achievements.push("Music therapy is adding a calming balance to your day.");
  }

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

  if (hydrationStatus === "critical") {
    risks.push("Hydration appears very low today.");
  }

  if (sleepStatus === "critical") {
    risks.push("Sleep duration may be too low for healthy recovery.");
  }

  if (stressStatus === "critical") {
    risks.push("Stress or anxiety signals need careful attention.");
  } else if (stressStatus === "needs_attention") {
    risks.push("Stress patterns may need extra support today.");
  }

  const riskMemory = memories.find(
    (memory) => memory.category === "risk_signal"
  );

  if (riskMemory) {
    risks.push(riskMemory.title);
  }

  return Array.from(new Set(risks)).slice(0, 4);
}

function buildCoachInsight({
  overallTrend,
  recommendedFocus,
}: {
  overallTrend: WellnessTrend;
  recommendedFocus: WellnessFocusArea;
}) {
  if (overallTrend === "improving") {
    return `You are showing positive momentum. Today, the best focus area is ${recommendedFocus.replace(
      "_",
      " "
    )}.`;
  }

  if (overallTrend === "declining") {
    return `Your wellness may need extra care today. Start with ${recommendedFocus.replace(
      "_",
      " "
    )} and keep the plan simple.`;
  }

  return `Your wellness looks steady. A focused improvement in ${recommendedFocus.replace(
    "_",
    " "
  )} can help build better consistency.`;
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

  const recommendedFocus = getRecommendedFocus({
    hydrationStatus,
    sleepStatus,
    stressStatus,
    yogaStatus,
  });

  const overallTrend = getOverallTrend({
    dashboard,
    memories,
  });

  return {
    overallTrend,
    hydrationStatus,
    sleepStatus,
    stressStatus,
    yogaStatus,
    musicStatus,
    recommendedFocus,
    achievements: buildAchievements({
      dashboard,
      hydrationStatus,
      sleepStatus,
      yogaStatus,
      musicStatus,
    }),
    riskSignals: buildRiskSignals({
      hydrationStatus,
      sleepStatus,
      stressStatus,
      memories,
    }),
    coachInsight: buildCoachInsight({
      overallTrend,
      recommendedFocus,
    }),
    generatedAt: new Date().toISOString(),
  };
}