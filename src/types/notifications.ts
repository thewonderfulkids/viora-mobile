export type WellnessReminderType =
  | "hydration"
  | "sleep"
  | "yoga"
  | "ai_memory"
  | "weekly_insight";

export type WellnessReminderPriority = "low" | "medium" | "high" | "critical";

export type WellnessReminderStatus = "scheduled" | "sent" | "completed" | "dismissed" | "paused";

export type WellnessReminderChannel = "in_app" | "push" | "email" | "whatsapp" | "voice";

export type WellnessReminderSource =
  | "user_settings"
  | "ai_memory"
  | "activity_engine"
  | "system";

export type WellnessReminderCadence = "daily" | "weekly" | "smart";

export type WellnessReminder = {
  id: string;
  userId: string;
  type: WellnessReminderType;
  title: string;
  message: string;
  actionLabel: string;
  actionRoute: string;
  priority: WellnessReminderPriority;
  status: WellnessReminderStatus;
  source: WellnessReminderSource;
  channel: WellnessReminderChannel;
  cadence: WellnessReminderCadence;
  scheduledFor: string;
  completedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metadata: {
    memoryId?: string;
    recommendationId?: string;
    targetValue?: number;
    targetUnit?: string;
    confidence?: number;
    premiumOnly?: boolean;
    familyReady?: boolean;
    voiceReady?: boolean;
  };
};

export type ReminderPreference = {
  enabled: boolean;
  preferredTime: string;
};

export type SmartReminderSettings = {
  userId: string;
  enabled: boolean;
  hydration: ReminderPreference;
  sleep: ReminderPreference;
  yoga: ReminderPreference;
  aiMemory: ReminderPreference;
  weeklyInsight: ReminderPreference;
  quietHoursStart: string;
  quietHoursEnd: string;
  timezone: string;
  channels: WellnessReminderChannel[];
  premiumPersonalizationEnabled: boolean;
  familyAccountReady: boolean;
  voiceReminderReady: boolean;
  smartNotificationReady: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SmartReminderSettingsInput = {
  userId: string;
  enabled?: boolean;
  hydration?: Partial<ReminderPreference>;
  sleep?: Partial<ReminderPreference>;
  yoga?: Partial<ReminderPreference>;
  aiMemory?: Partial<ReminderPreference>;
  weeklyInsight?: Partial<ReminderPreference>;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
  channels?: WellnessReminderChannel[];
  premiumPersonalizationEnabled?: boolean;
  familyAccountReady?: boolean;
  voiceReminderReady?: boolean;
  smartNotificationReady?: boolean;
};

export type SmartNotificationDashboard = {
  userId: string;
  generatedAt: string;
  settings: SmartReminderSettings;
  reminders: WellnessReminder[];
  activeReminders: WellnessReminder[];
  completedReminders: WellnessReminder[];
  dismissedReminders: WellnessReminder[];
  statistics: SmartNotificationStat[];
  nextReminder: WellnessReminder | null;
};

export type SmartNotificationStat = {
  label: string;
  value: string;
  helper: string;
};

export type GenerateReminderInput = {
  userId: string;
  timezone?: string;
};
