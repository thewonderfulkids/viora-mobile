export type VioraLanguageCode = "en" | "hi" | "hinglish";

export type VioraThemePreference = "system" | "light" | "dark";

export type UserSettingsPreferences = {
  id: string;
  userId: string;
  language: VioraLanguageCode;
  theme: VioraThemePreference;
  smartNotificationsEnabled: boolean;
  hydrationRemindersEnabled: boolean;
  sleepRemindersEnabled: boolean;
  yogaRemindersEnabled: boolean;
  nutritionRemindersEnabled: boolean;
  moodCheckInRemindersEnabled: boolean;
  aiMemoryEnabled: boolean;
  aiPersonalizationEnabled: boolean;
  dataExportRequestedAt: string | null;
  deleteAccountRequestedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountSecuritySnapshot = {
  userId: string;
  email: string;
  emailVerified: boolean;
  providerId: string;
  lastSignInTime: string | null;
  creationTime: string | null;
  passwordChangeAvailable: boolean;
  twoFactorReady: boolean;
};

export type SettingsDashboard = {
  preferences: UserSettingsPreferences;
  security: AccountSecuritySnapshot;
  accountSummary: {
    displayName: string;
    email: string;
    planName: string;
    memberSince: string;
    aiMemoryStatus: "On" | "Paused";
    notificationStatus: "On" | "Paused";
  };
  privacySummary: {
    aiMemoryEnabled: boolean;
    aiPersonalizationEnabled: boolean;
    dataExportRequestedAt: string | null;
    deleteAccountRequestedAt: string | null;
  };
};

export type SettingsPreferencePatch = Partial<
  Pick<
    UserSettingsPreferences,
    | "language"
    | "theme"
    | "smartNotificationsEnabled"
    | "hydrationRemindersEnabled"
    | "sleepRemindersEnabled"
    | "yogaRemindersEnabled"
    | "nutritionRemindersEnabled"
    | "moodCheckInRemindersEnabled"
    | "aiMemoryEnabled"
    | "aiPersonalizationEnabled"
    | "dataExportRequestedAt"
    | "deleteAccountRequestedAt"
  >
>;
