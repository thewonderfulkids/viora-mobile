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