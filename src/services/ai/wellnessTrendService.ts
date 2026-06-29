import { WellnessTimeline } from "../../types";
import { DashboardData } from "../dashboardService";

function buildTrend(
  value: number,
  goodThreshold: number,
  title: string,
  metric: string
) {
  if (value >= goodThreshold) {
    return {
      title,
      metric,
      trend: "up" as const,
      percentage: 18,
      description: `${title} is improving.`,
    };
  }

  if (value > 0) {
    return {
      title,
      metric,
      trend: "stable" as const,
      percentage: 6,
      description: `${title} is stable.`,
    };
  }

  return {
    title,
    metric,
    trend: "down" as const,
    percentage: -12,
    description: `${title} needs attention.`,
  };
}

export function buildWellnessTimeline(
  dashboard: DashboardData
): WellnessTimeline {
  return {
    hydration: buildTrend(
      dashboard.todayStats.waterMl,
      2000,
      "Hydration",
      "Water"
    ),

    sleep: buildTrend(
      dashboard.todayStats.sleepMinutes,
      420,
      "Sleep",
      "Minutes"
    ),

    yoga: buildTrend(
      dashboard.todayStats.yogaMinutes,
      20,
      "Yoga",
      "Minutes"
    ),

    music: buildTrend(
      dashboard.todayStats.musicMinutes,
      15,
      "Music Therapy",
      "Minutes"
    ),

    overallTrend:
      dashboard.wellnessScore >= 75
        ? "up"
        : dashboard.wellnessScore >= 50
        ? "stable"
        : "down",

    generatedAt: new Date().toISOString(),
  };
}