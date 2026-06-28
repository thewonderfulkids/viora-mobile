export type DashboardInsight = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};

export type DashboardAnalytics = {
  hydrationPercent: number;
  sleepPercent: number;
  yogaPercent: number;
  wellnessAverage: number;

  currentStreak: number;
  longestStreak: number;

  todayFocus: string;

  insight: DashboardInsight;
};