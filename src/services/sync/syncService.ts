import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

import {
  clearAllSyncActions,
  clearSyncedSyncActions,
  getLastSyncedAt,
  getPendingSyncActions,
  savePendingSyncAction,
} from "../../repositories";
import { AppDiagnostics, PendingSyncAction, SyncActionType, SyncQueueSummary } from "../../types";

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function queueOfflineAction(input: {
  userId: string;
  type: SyncActionType;
  title: string;
  description: string;
  payload?: Record<string, unknown>;
}) {
  // Reject payloads that cannot survive AsyncStorage JSON serialization.
  // Silent serialization loss would make eventual server replay unreliable.
  const payload = input.payload ?? {};
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new Error("Offline action payload must be a JSON object.");
  }
  let serializedPayload: string;
  try {
    serializedPayload = JSON.stringify(payload);
  } catch {
    throw new Error("Offline action payload must be JSON serializable.");
  }
  if (typeof serializedPayload !== "string" || serializedPayload.length > 65536) {
    throw new Error("Offline action payload is invalid or exceeds 64 KiB.");
  }
  if (JSON.stringify(JSON.parse(serializedPayload)) !== serializedPayload) {
    throw new Error("Offline action payload cannot be safely serialized.");
  }
  const now = new Date().toISOString();
  const action: PendingSyncAction = {
    id: createId(input.type),
    userId: input.userId,
    type: input.type,
    title: input.title,
    description: input.description,
    payload: JSON.parse(serializedPayload) as Record<string, unknown>,
    status: "pending",
    attempts: 0,
    createdAt: now,
    updatedAt: now,
  };

  return savePendingSyncAction(action);
}

export async function loadSyncQueue() {
  return getPendingSyncActions();
}

export async function clearSyncedActions() {
  return clearSyncedSyncActions();
}

export async function clearSyncQueue() {
  await clearAllSyncActions();
  return [];
}

/**
 * Phase A safety guard: never acknowledge a queued mutation without a
 * successful, authenticated server write.
 *
 * Queue payloads currently have no defined replay schema or idempotency key.
 * Blindly replaying them could corrupt user data or duplicate logs.
 * Keep them pending until per-action replay handlers are implemented.
 */
export async function flushSyncQueue() {
  const queue = await getPendingSyncActions();
  const unsynced = queue.filter((item) => item.status !== "synced");
  if (unsynced.length > 0) {
    throw new Error(
      "Offline changes are safely retained on this device. Server sync is not yet available; no changes have been marked as synced."
    );
  }
  // No pending actions: do not claim a new server sync occurred.
  return queue;
}

export async function buildSyncSummary(queue?: PendingSyncAction[]): Promise<SyncQueueSummary> {
  const items = queue || (await getPendingSyncActions());
  const lastSyncedAt = await getLastSyncedAt();
  const lastQueuedAt = items.length > 0 ? items.reduce((latest, item) => {
    const itemTime = new Date(item.createdAt).getTime();
    const latestTime = latest ? new Date(latest).getTime() : 0;
    return itemTime > latestTime ? item.createdAt : latest;
  }, null as string | null) : null;

  return {
    pendingCount: items.filter((item) => item.status === "pending" || item.status === "syncing").length,
    failedCount: items.filter((item) => item.status === "failed").length,
    syncedCount: items.filter((item) => item.status === "synced").length,
    lastSyncedAt,
    lastQueuedAt,
  };
}

export function buildAppDiagnostics(input: {
  isOnline: boolean;
  isCheckingNetwork: boolean;
  lastCheckedAt: number | null;
}): AppDiagnostics {
  const configVersion = Constants.expoConfig?.version || "1.0.0";
  const androidVersionCode = Constants.expoConfig?.android?.versionCode;
  const iosBuildNumber = Constants.expoConfig?.ios?.buildNumber;

  return {
    appVersion: configVersion,
    buildNumber: String(androidVersionCode || iosBuildNumber || "1"),
    platform: Platform.OS,
    deviceName: Device.deviceName || "Unknown device",
    osName: Device.osName || Platform.OS,
    osVersion: Device.osVersion || "Unknown",
    isDevice: Boolean(Device.isDevice),
    networkLabel: input.isCheckingNetwork ? "Checking" : input.isOnline ? "Online" : "Offline",
    lastCheckedAt: input.lastCheckedAt ? new Date(input.lastCheckedAt).toISOString() : null,
    generatedAt: new Date().toISOString(),
  };
}
