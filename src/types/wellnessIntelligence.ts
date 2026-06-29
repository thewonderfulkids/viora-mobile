export type WellnessTrend = "improving" | "stable" | "declining" | "unknown";

export type WellnessStatus =
  | "excellent"
  | "good"
  | "needs_attention"
  | "critical"
  | "unknown";

export type WellnessFocusArea =
  | "hydration"
  | "sleep"
  | "stress"
  | "yoga"
  | "music"
  | "consistency"
  | "balanced_routine";

export type WellnessSignalCategory =
  | "hydration"
  | "sleep"
  | "activity"
  | "recovery"
  | "stress"
  | "routine"
  | "ai_memory";

export type WellnessSeverity = "positive" | "neutral" | "watch" | "risk";

export type WellnessIntelligence = {
  overallTrend: WellnessTrend;
  hydrationStatus: WellnessStatus;
  sleepStatus: WellnessStatus;
  stressStatus: WellnessStatus;
  yogaStatus: WellnessStatus;
  musicStatus: WellnessStatus;
  recommendedFocus: WellnessFocusArea;
  achievements: string[];
  riskSignals: string[];
  coachInsight: string;
  generatedAt: string;
};

export type WellnessMetricSnapshot = {
  key: WellnessFocusArea | "overall";
  label: string;
  value: number;
  goal: number;
  unit: string;
  status: WellnessStatus;
  trend: WellnessTrend;
  helperText: string;
};

export type WellnessInsight = {
  id: string;
  category: WellnessSignalCategory;
  title: string;
  message: string;
  severity: WellnessSeverity;
  confidence: number;
};

export type WellnessRecommendation = {
  id: string;
  focusArea: WellnessFocusArea;
  title: string;
  action: string;
  reason: string;
  priority: number;
  premiumReady: boolean;
  notificationReady: boolean;
};

export type WellnessTimelineEvent = {
  id: string;
  title: string;
  description: string;
  dateKey: string;
  category: WellnessSignalCategory;
  scoreImpact: number;
};

export type WellnessRiskSignal = {
  id: string;
  title: string;
  message: string;
  severity: Extract<WellnessSeverity, "watch" | "risk">;
  category: WellnessSignalCategory;
};

export type WellnessLearningStatistic = {
  label: string;
  value: string;
  helper: string;
};

export type WellnessIntelligenceDashboard = WellnessIntelligence & {
  dailyWellnessIndex: number;
  weeklyAverageScore: number;
  consistencyScore: number;
  riskLevel: "low" | "medium" | "high";
  generatedAt: string;
  summary: string;
  primaryFocus: WellnessFocusArea;
  coreIntelligence: WellnessIntelligence;
  metrics: WellnessMetricSnapshot[];
  trends: WellnessMetricSnapshot[];
  insights: WellnessInsight[];
  risks: WellnessRiskSignal[];
  recommendations: WellnessRecommendation[];
  timeline: WellnessTimelineEvent[];
  statistics: WellnessLearningStatistic[];
};

export type WellnessIntelligenceSnapshot = {
  id: string;
  userId: string;
  dateKey: string;
  dailyWellnessIndex: number;
  weeklyAverageScore: number;
  consistencyScore: number;
  riskLevel: "low" | "medium" | "high";
  primaryFocus: WellnessFocusArea;
  summary: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
};
