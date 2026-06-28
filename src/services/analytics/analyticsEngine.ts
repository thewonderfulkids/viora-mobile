import { DashboardData } from "../dashboardService";
import { DashboardAnalytics } from "./types";

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function buildDashboardAnalytics(
  dashboard: DashboardData
): DashboardAnalytics {

  const hydrationPercent = clamp(
    (dashboard.todayStats.waterMl /
      (dashboard.user?.waterGoalMl || 2500)) *
      100
  );

  const sleepPercent = clamp(
    (dashboard.todayStats.sleepMinutes / (8 * 60)) * 100
  );

  const yogaPercent = clamp(
    (dashboard.todayStats.yogaMinutes / 30) * 100
  );

  let todayFocus = "Maintain Balance";

  if (hydrationPercent < 70) {
    todayFocus = "Increase Hydration";
  } else if (sleepPercent < 70) {
    todayFocus = "Improve Sleep";
  } else if (yogaPercent < 70) {
    todayFocus = "Move Your Body";
  }

  let title = "Excellent Progress";
  let description =
    "Keep following your wellness routine today.";
  let priority: "low" | "medium" | "high" = "low";

  if (hydrationPercent < 60) {
    title = "Hydration Needed";
    description =
      "Drink water consistently during the next few hours.";
    priority = "high";
  } else if (sleepPercent < 70) {
    title = "Sleep Recovery";
    description =
      "Try sleeping a little earlier tonight.";
    priority = "medium";
  }

  return {
    hydrationPercent,

    sleepPercent,

    yogaPercent,

    wellnessAverage: Math.round(
      (hydrationPercent +
        sleepPercent +
        yogaPercent) /
        3
    ),

    currentStreak: 5,

    longestStreak: 12,

    todayFocus,

    insight: {
      title,
      description,
      priority,
    },
  };
}