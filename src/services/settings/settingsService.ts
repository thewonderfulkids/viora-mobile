import { User } from "firebase/auth";

import { getActiveSubscriptionByUser } from "../../repositories";
import { getOrCreateUserSettings, updateUserSettings } from "../../repositories/settingsRepository";
import { AccountSecuritySnapshot, SettingsDashboard, SettingsPreferencePatch, UserSettingsPreferences } from "../../types";
import { getPremiumPlanByCode } from "../premium";

function getProviderId(user: User | null) {
  return user?.providerData?.[0]?.providerId || "password";
}

function buildSecurity(user: User | null): AccountSecuritySnapshot {
  return {
    userId: user?.uid || "",
    email: user?.email || "",
    emailVerified: Boolean(user?.emailVerified),
    providerId: getProviderId(user),
    lastSignInTime: user?.metadata?.lastSignInTime || null,
    creationTime: user?.metadata?.creationTime || null,
    passwordChangeAvailable: getProviderId(user) === "password",
    twoFactorReady: false,
  };
}

export async function getSettingsDashboard(input: {
  user: User | null;
  displayName: string;
}): Promise<SettingsDashboard> {
  const userId = input.user?.uid || "";

  if (!userId) {
    throw new Error("Please login to manage settings.");
  }

  const preferences = await getOrCreateUserSettings(userId);
  const subscription = await getActiveSubscriptionByUser(userId);
  const plan = getPremiumPlanByCode(subscription?.planCode || "FREE");

  return {
    preferences,
    security: buildSecurity(input.user),
    accountSummary: {
      displayName: input.displayName || input.user?.email?.split("@")[0] || "Viora User",
      email: input.user?.email || "No email",
      planName: plan.displayName,
      memberSince: input.user?.metadata?.creationTime || preferences.createdAt,
      aiMemoryStatus: preferences.aiMemoryEnabled ? "On" : "Paused",
      notificationStatus: preferences.smartNotificationsEnabled ? "On" : "Paused",
    },
    privacySummary: {
      aiMemoryEnabled: preferences.aiMemoryEnabled,
      aiPersonalizationEnabled: preferences.aiPersonalizationEnabled,
      dataExportRequestedAt: preferences.dataExportRequestedAt,
      deleteAccountRequestedAt: preferences.deleteAccountRequestedAt,
    },
  };
}

export async function saveSettingsPreferences(userId: string, patch: SettingsPreferencePatch): Promise<UserSettingsPreferences> {
  return updateUserSettings(userId, patch);
}
