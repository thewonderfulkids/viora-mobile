export type DashboardPriority = "low" | "medium" | "high";

export type DashboardSmartActionKind =
  | "hydration"
  | "nutrition"
  | "aiCoach"
  | "reports"
  | "goals"
  | "mood"
  | "family"
  | "notifications";

export type DashboardSmartAction = {
  id: string;
  kind: DashboardSmartActionKind;
  title: string;
  subtitle: string;
  route: string;
  priority: DashboardPriority;
};

export type DashboardTrendMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  progress: number;
  priority: DashboardPriority;
};

export type DashboardBriefing = {
  greeting: string;
  headline: string;
  summary: string;
  focus: string;
  recommendation: string;
};

export type DashboardTimelineItem = {
  id: string;
  timeLabel: string;
  title: string;
  description: string;
  completed: boolean;
  route: string;
};

export type DashboardAchievement = {
  id: string;
  title: string;
  description: string;
  value: string;
};

export type DashboardFamilySnapshot = {
  enabled: boolean;
  title: string;
  description: string;
  route: string;
  memberCount: number;
};

export type DashboardIntelligence = {
  wellnessScore: number;
  briefing: DashboardBriefing;
  trends: DashboardTrendMetric[];
  smartActions: DashboardSmartAction[];
  timeline: DashboardTimelineItem[];
  achievements: DashboardAchievement[];
  familySnapshot: DashboardFamilySnapshot;
};
