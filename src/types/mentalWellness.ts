export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type MoodTone = "positive" | "warning" | "neutral";

export type MoodEmotion =
  | "calm"
  | "happy"
  | "focused"
  | "tired"
  | "stressed"
  | "anxious"
  | "sad"
  | "angry"
  | "overwhelmed";

export type MoodTrigger =
  | "work"
  | "family"
  | "sleep"
  | "food"
  | "health"
  | "money"
  | "social"
  | "screen_time"
  | "unknown";

export type CopingAction =
  | "breathing"
  | "walk"
  | "journal"
  | "music"
  | "yoga"
  | "water"
  | "rest"
  | "talk_to_someone";

export type MoodEntrySource = "manual" | "ai_suggestion" | "voice" | "system";

export type MoodEntryDoc = {
  id: string;
  userId: string;
  dateKey: string;
  moodLevel: MoodLevel;
  stressLevel: number;
  energyLevel: number;
  sleepImpact: number;
  emotions: MoodEmotion[];
  triggers: MoodTrigger[];
  copingActions: CopingAction[];
  note: string;
  aiReflection: string;
  source: MoodEntrySource;
  premiumOnly: boolean;
  familyAccountReady: boolean;
  voiceReady: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type MoodEntryInput = {
  userId: string;
  dateKey?: string;
  moodLevel: MoodLevel;
  stressLevel: number;
  energyLevel: number;
  sleepImpact: number;
  emotions: MoodEmotion[];
  triggers: MoodTrigger[];
  copingActions: CopingAction[];
  note?: string;
  source?: MoodEntrySource;
};

export type MentalWellnessSummaryDoc = {
  id: string;
  userId: string;
  dateKey: string;
  moodScore: number;
  stressScore: number;
  energyScore: number;
  emotionalBalanceScore: number;
  checkInStreak: number;
  riskLevel: "low" | "medium" | "high";
  dominantEmotion: MoodEmotion | "unknown";
  dominantTrigger: MoodTrigger | "unknown";
  aiSummary: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
};

export type MentalMetric = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: MoodTone;
};

export type MentalInsight = {
  id: string;
  title: string;
  message: string;
  tone: MoodTone;
};

export type CopingSuggestion = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  recommendedAction: CopingAction;
  suggestedMoodInput: Omit<MoodEntryInput, "userId">;
};

export type MoodTimelineItem = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  tone: MoodTone;
};

export type MentalWellnessDashboard = {
  userId: string;
  dateKey: string;
  generatedAt: string;
  entries: MoodEntryDoc[];
  todayEntry: MoodEntryDoc | null;
  summary: MentalWellnessSummaryDoc;
  metrics: MentalMetric[];
  insights: MentalInsight[];
  suggestions: CopingSuggestion[];
  timeline: MoodTimelineItem[];
  moodScore: number;
  stressScore: number;
  emotionalBalanceScore: number;
  weeklyAverageMoodScore: number;
  monthlyTrend: "improving" | "stable" | "needs_attention";
  aiCoachContext: string;
  aiMemoryContext: string;
  wellnessIntelligenceContext: string;
  notificationContext: string;
  voiceCommandContext: string;
};
