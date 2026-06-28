export type WellnessMetricTrend =
  | "up"
  | "down"
  | "stable"
  | "unknown";

export type WellnessTimelineItem = {
  title: string;
  metric: string;
  trend: WellnessMetricTrend;
  percentage: number;
  description: string;
};

export type WellnessTimeline = {
  hydration: WellnessTimelineItem;
  sleep: WellnessTimelineItem;
  yoga: WellnessTimelineItem;
  music: WellnessTimelineItem;
  overallTrend: WellnessMetricTrend;
  generatedAt: string;
};