import AsyncStorage from "@react-native-async-storage/async-storage";

import { LaunchAuditSnapshot } from "../types";

const LAUNCH_AUDIT_KEY = "@viora/launch-audit/v1";

export async function saveLaunchAuditSnapshot(snapshot: LaunchAuditSnapshot): Promise<LaunchAuditSnapshot> {
  await AsyncStorage.setItem(LAUNCH_AUDIT_KEY, JSON.stringify(snapshot));
  return snapshot;
}

export async function getLaunchAuditSnapshot(): Promise<LaunchAuditSnapshot | null> {
  const raw = await AsyncStorage.getItem(LAUNCH_AUDIT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LaunchAuditSnapshot;
  } catch {
    await AsyncStorage.removeItem(LAUNCH_AUDIT_KEY);
    return null;
  }
}

export async function clearLaunchAuditSnapshot(): Promise<void> {
  await AsyncStorage.removeItem(LAUNCH_AUDIT_KEY);
}
