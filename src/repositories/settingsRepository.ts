import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { SettingsPreferencePatch, UserSettingsPreferences } from "../types";

function nowIso() {
  return new Date().toISOString();
}

function getSettingsRef(userId: string) {
  return doc(db, COLLECTIONS.userSettings, userId);
}

function buildDefaultSettings(userId: string): UserSettingsPreferences {
  const timestamp = nowIso();

  return {
    id: userId,
    userId,
    language: "en",
    theme: "system",
    smartNotificationsEnabled: true,
    hydrationRemindersEnabled: true,
    sleepRemindersEnabled: true,
    yogaRemindersEnabled: true,
    nutritionRemindersEnabled: true,
    moodCheckInRemindersEnabled: true,
    aiMemoryEnabled: true,
    aiPersonalizationEnabled: true,
    dataExportRequestedAt: null,
    deleteAccountRequestedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function toSettings(userId: string, data: any): UserSettingsPreferences {
  const fallback = buildDefaultSettings(userId);

  return {
    ...fallback,
    ...data,
    id: String(data?.id || userId),
    userId: String(data?.userId || userId),
    language: data?.language || fallback.language,
    theme: data?.theme || fallback.theme,
    smartNotificationsEnabled: data?.smartNotificationsEnabled ?? fallback.smartNotificationsEnabled,
    hydrationRemindersEnabled: data?.hydrationRemindersEnabled ?? fallback.hydrationRemindersEnabled,
    sleepRemindersEnabled: data?.sleepRemindersEnabled ?? fallback.sleepRemindersEnabled,
    yogaRemindersEnabled: data?.yogaRemindersEnabled ?? fallback.yogaRemindersEnabled,
    nutritionRemindersEnabled: data?.nutritionRemindersEnabled ?? fallback.nutritionRemindersEnabled,
    moodCheckInRemindersEnabled: data?.moodCheckInRemindersEnabled ?? fallback.moodCheckInRemindersEnabled,
    aiMemoryEnabled: data?.aiMemoryEnabled ?? fallback.aiMemoryEnabled,
    aiPersonalizationEnabled: data?.aiPersonalizationEnabled ?? fallback.aiPersonalizationEnabled,
    dataExportRequestedAt: data?.dataExportRequestedAt || null,
    deleteAccountRequestedAt: data?.deleteAccountRequestedAt || null,
    createdAt: String(data?.createdAt || fallback.createdAt),
    updatedAt: String(data?.updatedAt || fallback.updatedAt),
  };
}

export async function getOrCreateUserSettings(userId: string): Promise<UserSettingsPreferences> {
  const ref = getSettingsRef(userId);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return toSettings(userId, snapshot.data());
  }

  const payload = buildDefaultSettings(userId);
  await setDoc(ref, {
    ...payload,
    serverUpdatedAt: serverTimestamp(),
  });

  return payload;
}

export async function updateUserSettings(userId: string, patch: SettingsPreferencePatch): Promise<UserSettingsPreferences> {
  const existing = await getOrCreateUserSettings(userId);
  const updated: UserSettingsPreferences = {
    ...existing,
    ...patch,
    id: userId,
    userId,
    updatedAt: nowIso(),
  };

  await updateDoc(getSettingsRef(userId), {
    ...patch,
    updatedAt: updated.updatedAt,
    serverUpdatedAt: serverTimestamp(),
  });

  return updated;
}
