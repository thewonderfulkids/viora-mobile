export type GoalCategory =
  | "hydration"
  | "sleep"
  | "movement"
  | "mindfulness"
  | "nutrition"
  | "weight"
  | "general";

export type GoalStatus = "active" | "completed" | "archived";

export type GoalProgressUnit =
  | "ml"
  | "minutes"
  | "sessions"
  | "days"
  | "kg"
  | "score"
  | "custom";

export type HabitFrequency = "daily" | "weekly" | "monthly";

export type HabitStatus = "active" | "paused" | "archived";

export type HabitCompletionStatus = "completed" | "missed";

export type GoalPredictionStatus = "on_track" | "needs_attention" | "at_risk" | "completed";

export type GoalDoc = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: GoalProgressUnit;
  targetDate: string;
  status: GoalStatus;
  source: "manual" | "ai_suggestion" | "system";
  premiumOnly: boolean;
  familyAccountReady: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  completedAt?: string | null;
  isDeleted: boolean;
};

export type HabitDoc = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: GoalCategory;
  frequency: HabitFrequency;
  targetPerPeriod: number;
  reminderTime?: string | null;
  status: HabitStatus;
  source: "manual" | "ai_suggestion" | "system";
  streak: number;
  bestStreak: number;
  lastCompletedDate?: string | null;
  premiumOnly: boolean;
  familyAccountReady: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string | null;
  isDeleted: boolean;
};

export type HabitCompletionDoc = {
  id: string;
  userId: string;
  habitId: string;
  dateKey: string;
  status: HabitCompletionStatus;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type GoalInput = {
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  targetValue: number;
  currentValue?: number;
  unit: GoalProgressUnit;
  targetDate: string;
  source?: GoalDoc["source"];
};

export type HabitInput = {
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  frequency: HabitFrequency;
  targetPerPeriod?: number;
  reminderTime?: string | null;
  source?: HabitDoc["source"];
};

export type GoalHabitStat = {
  label: string;
  value: string;
  helper: string;
};

export type GoalInsight = {
  id: string;
  title: string;
  message: string;
  tone: "positive" | "warning" | "neutral";
};

export type GoalSuggestion = {
  id: string;
  type: "goal" | "habit";
  title: string;
  description: string;
  category: GoalCategory;
  actionLabel: string;
  goal?: Omit<GoalInput, "userId">;
  habit?: Omit<HabitInput, "userId">;
};

export type GoalPrediction = {
  goalId: string;
  status: GoalPredictionStatus;
  progressPercent: number;
  daysRemaining: number;
  message: string;
};

export type HabitAnalytics = {
  habitId: string;
  completedCount: number;
  missedCount: number;
  consistencyPercent: number;
  streak: number;
  bestStreak: number;
};

export type GoalHabitDashboard = {
  userId: string;
  generatedAt: string;
  goals: GoalDoc[];
  habits: HabitDoc[];
  completions: HabitCompletionDoc[];
  activeGoals: GoalDoc[];
  activeHabits: HabitDoc[];
  completedGoals: GoalDoc[];
  archivedGoals: GoalDoc[];
  statistics: GoalHabitStat[];
  insights: GoalInsight[];
  suggestions: GoalSuggestion[];
  predictions: GoalPrediction[];
  habitAnalytics: HabitAnalytics[];
  consistencyScore: number;
  completionScore: number;
  weeklySummary: string;
  monthlySummary: string;
  aiCoachContext: string;
  aiMemoryContext: string;
  notificationContext: string;
};
