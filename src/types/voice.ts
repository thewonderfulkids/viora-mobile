export type VoiceLanguage = "en" | "hi" | "hinglish";

export type VoiceProviderStatus = "idle" | "listening" | "processing" | "speaking" | "unsupported" | "error";

export type VoiceIntentType =
  | "navigation"
  | "log_hydration"
  | "log_nutrition"
  | "log_mood"
  | "log_sleep"
  | "create_goal"
  | "read_report"
  | "coach_question"
  | "unknown";

export type VoiceActionStatus = "ready" | "completed" | "needs_confirmation" | "unsupported" | "failed";

export type VoiceNavigationTarget =
  | "/dashboard"
  | "/ai-coach"
  | "/reports"
  | "/hydration"
  | "/nutrition"
  | "/mental-wellness"
  | "/sleep"
  | "/goals-habits"
  | "/wellness-intelligence"
  | "/smart-notifications"
  | "/premium"
  | "/settings-center";

export type VoiceIntent = {
  type: VoiceIntentType;
  confidence: number;
  language: VoiceLanguage;
  targetRoute?: VoiceNavigationTarget;
  amountMl?: number;
  mealText?: string;
  moodText?: string;
  sleepText?: string;
  goalText?: string;
  question?: string;
  entities: Record<string, string | number | boolean>;
};

export type VoiceCommandResult = {
  id: string;
  transcript: string;
  intent: VoiceIntent;
  status: VoiceActionStatus;
  title: string;
  message: string;
  spokenResponse: string;
  targetRoute?: VoiceNavigationTarget;
  createdAt: string;
};

export type VoiceCommandRecord = VoiceCommandResult & {
  userId: string;
  rawTranscript: string;
  provider: "browser" | "manual" | "mock";
  isDeleted: boolean;
  updatedAt: string;
};

export type VoiceQuickAction = {
  id: string;
  label: string;
  command: string;
  helper: string;
  icon: string;
};

export type VoiceAICapability = {
  id: string;
  title: string;
  description: string;
  status: "active" | "ready" | "future";
};

export type VoiceAIDashboard = {
  status: VoiceProviderStatus;
  providerLabel: string;
  lastTranscript: string;
  lastResult: VoiceCommandResult | null;
  quickActions: VoiceQuickAction[];
  capabilities: VoiceAICapability[];
  history: VoiceCommandRecord[];
  aiCoachContext: string;
};
