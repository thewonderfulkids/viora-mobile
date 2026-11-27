import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import {
  SmartReminderSettings,
  SmartReminderSettingsInput,
  WellnessReminder,
  WellnessReminderStatus,
} from "../types";

function nowIso() {
  return new Date().toISOString();
}

function buildDefaultSettings(userId: string, timezone = "Asia/Kolkata"): SmartReminderSettings {
  const now = nowIso();

  return {
    userId,
    enabled: true,
    hydration: {
      enabled: true,
      preferredTime: "10:00",
    },
    sleep: {
      enabled: true,
      preferredTime: "22:30",
    },
    yoga: {
      enabled: true,
      preferredTime: "06:30",
    },
    aiMemory: {
      enabled: true,
      preferredTime: "19:30",
    },
    weeklyInsight: {
      enabled: true,
      preferredTime: "09:00",
    },
    quietHoursStart: "23:00",
    quietHoursEnd: "06:00",
    timezone,
    channels: ["in_app"],
    premiumPersonalizationEnabled: false,
    familyAccountReady: true,
    voiceReminderReady: true,
    smartNotificationReady: true,
    createdAt: now,
    updatedAt: now,
  };
}

function mergePreference(
  current: SmartReminderSettings["hydration"],
  next?: Partial<SmartReminderSettings["hydration"]>
) {
  return {
    enabled: next?.enabled ?? current.enabled,
    preferredTime: next?.preferredTime ?? current.preferredTime,
  };
}

function normalizeSettingsInput(
  existing: SmartReminderSettings,
  input: SmartReminderSettingsInput
): SmartReminderSettings {
  return {
    ...existing,
    enabled: input.enabled ?? existing.enabled,
    hydration: mergePreference(existing.hydration, input.hydration),
    sleep: mergePreference(existing.sleep, input.sleep),
    yoga: mergePreference(existing.yoga, input.yoga),
    aiMemory: mergePreference(existing.aiMemory, input.aiMemory),
    weeklyInsight: mergePreference(existing.weeklyInsight, input.weeklyInsight),
    quietHoursStart: input.quietHoursStart ?? existing.quietHoursStart,
    quietHoursEnd: input.quietHoursEnd ?? existing.quietHoursEnd,
    timezone: input.timezone ?? existing.timezone,
    channels: input.channels ?? existing.channels,
    premiumPersonalizationEnabled:
      input.premiumPersonalizationEnabled ?? existing.premiumPersonalizationEnabled,
    familyAccountReady: input.familyAccountReady ?? existing.familyAccountReady,
    voiceReminderReady: input.voiceReminderReady ?? existing.voiceReminderReady,
    smartNotificationReady: input.smartNotificationReady ?? existing.smartNotificationReady,
    updatedAt: nowIso(),
  };
}

export async function getSmartReminderSettings(
  userId: string,
  assertCurrent: () => void = () => {},
): Promise<SmartReminderSettings> {
  assertCurrent();
  const settingsRef = doc(db, COLLECTIONS.reminderSettings, userId);
  const snapshot = await getDoc(settingsRef);
  assertCurrent();

  if (snapshot.exists()) {
    return snapshot.data() as SmartReminderSettings;
  }

  const defaultSettings = buildDefaultSettings(userId);
  await setDoc(settingsRef, defaultSettings);
  return defaultSettings;
}

export async function saveSmartReminderSettings(
  input: SmartReminderSettingsInput,
  assertCurrent: () => void = () => {},
): Promise<SmartReminderSettings> {
  const current = await getSmartReminderSettings(input.userId, assertCurrent);
  assertCurrent();
  const nextSettings = normalizeSettingsInput(current, input);
  const settingsRef = doc(db, COLLECTIONS.reminderSettings, input.userId);

  await setDoc(settingsRef, nextSettings, { merge: true });
  return nextSettings;
}

export async function getLatestWellnessReminders(
  userId: string,
  maxResults = 20
): Promise<WellnessReminder[]> {
  const remindersQuery = query(
    collection(db, COLLECTIONS.notifications),
    where("userId", "==", userId),
    orderBy("scheduledFor", "desc"),
    limit(maxResults)
  );

  const snapshot = await getDocs(remindersQuery);
  return snapshot.docs.map((item) => item.data() as WellnessReminder);
}

export async function saveWellnessReminders(
  reminders: WellnessReminder[]
): Promise<WellnessReminder[]> {
  await Promise.all(
    reminders.map((reminder) =>
      setDoc(doc(db, COLLECTIONS.notifications, reminder.id), reminder, { merge: true })
    )
  );

  return reminders;
}

export async function updateWellnessReminderStatus(
  reminderId: string,
  status: WellnessReminderStatus
): Promise<void> {
  const now = nowIso();
  const reminderRef = doc(db, COLLECTIONS.notifications, reminderId);

  await updateDoc(reminderRef, {
    status,
    updatedAt: now,
    completedAt: status === "completed" ? now : null,
    dismissedAt: status === "dismissed" ? now : null,
  });
}
