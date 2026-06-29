export type MemoryImportance = "low" | "medium" | "high" | "critical";

export type MemorySource =
  | "conversation"
  | "hydration"
  | "sleep"
  | "yoga"
  | "music"
  | "onboarding"
  | "system";

export type WellnessMemoryCategory =
  | "goal"
  | "preference"
  | "habit"
  | "risk_signal"
  | "progress"
  | "barrier"
  | "motivation"
  | "profile";

export type AIMemoryRecord = {
  id: string;
  userId: string;
  category: WellnessMemoryCategory;
  source: MemorySource;
  title: string;
  summary: string;
  importance: MemoryImportance;
  confidence: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastUsedAt: string | null;
  lastMentionedAt: string | null;
  expiresAt: string | null;
  usageCount: number;
  occurrenceCount: number;
  isActive: boolean;
  isPinned: boolean;
  isArchived: boolean;
};

export type ConversationSummary = {
  id: string;
  userId: string;
  conversationId: string;
  summary: string;
  keyTopics: string[];
  extractedMemories: string[];
  moodSignal: string | null;
  riskSignal: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserWellnessProfile = {
  userId: string;
  displayName: string;
  primaryGoal: string | null;
  stressLevel: string | null;
  preferredLanguage: string;
  hydrationGoalMl: number | null;
  sleepGoalHours: number | null;
  yogaGoalMinutes: number | null;
  musicPreference: string | null;
  lastMemoryUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMemoryInput = {
  userId: string;
  category: WellnessMemoryCategory;
  source: MemorySource;
  title: string;
  summary: string;
  importance?: MemoryImportance;
  confidence?: number;
  tags?: string[];
};

export type CreateConversationSummaryInput = {
  userId: string;
  conversationId: string;
  summary: string;
  keyTopics?: string[];
  extractedMemories?: string[];
  moodSignal?: string | null;
  riskSignal?: string | null;
};

export type UpsertWellnessProfileInput = {
  userId: string;
  displayName?: string;
  primaryGoal?: string | null;
  stressLevel?: string | null;
  preferredLanguage?: string;
  hydrationGoalMl?: number | null;
  sleepGoalHours?: number | null;
  yogaGoalMinutes?: number | null;
  musicPreference?: string | null;
};

export type AIMemoryStat = {
  label: string;
  value: string;
  helper: string;
};

export type AIMemoryInsight = {
  id: string;
  title: string;
  description: string;
  source: MemorySource | "profile" | "system";
  confidence: number;
};

export type AIMemoryTimelineItem = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  source: MemorySource | "profile" | "system";
  importance: MemoryImportance;
};

export type AIMemoryRecommendation = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  priority: MemoryImportance;
};

export type AIMemoryDashboard = {
  userId: string;
  generatedAt: string;
  wellnessProfile: UserWellnessProfile | null;
  learnedHabits: AIMemoryRecord[];
  wellnessPatterns: AIMemoryInsight[];
  conversationMemories: ConversationSummary[];
  weeklyInsights: AIMemoryInsight[];
  recommendations: AIMemoryRecommendation[];
  timeline: AIMemoryTimelineItem[];
  statistics: AIMemoryStat[];
  memoryCount: number;
  confidenceAverage: number;
  highPriorityCount: number;
};
