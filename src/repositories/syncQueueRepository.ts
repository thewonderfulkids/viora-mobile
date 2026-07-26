import AsyncStorage from "@react-native-async-storage/async-storage";

import { PendingSyncAction } from "../types";

const SYNC_QUEUE_KEY = "@viora/sync-queue/v1";
const LAST_SYNCED_AT_KEY = "@viora/sync-queue/last-synced-at";

function sortByNewest(items: PendingSyncAction[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

async function readQueue(): Promise<PendingSyncAction[]> {
  const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PendingSyncAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: PendingSyncAction[]) {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(sortByNewest(queue)));
}

export async function getPendingSyncActions(): Promise<PendingSyncAction[]> {
  return readQueue();
}

export async function savePendingSyncAction(action: PendingSyncAction): Promise<PendingSyncAction[]> {
  const queue = await readQueue();
  const nextQueue = [action, ...queue.filter((item) => item.id !== action.id)];
  await writeQueue(nextQueue);
  return nextQueue;
}

export async function updatePendingSyncAction(actionId: string, patch: Partial<PendingSyncAction>): Promise<PendingSyncAction[]> {
  const queue = await readQueue();
  const nextQueue = queue.map((item) => (item.id === actionId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  await writeQueue(nextQueue);
  return nextQueue;
}

export async function removePendingSyncAction(actionId: string): Promise<PendingSyncAction[]> {
  const queue = await readQueue();
  const nextQueue = queue.filter((item) => item.id !== actionId);
  await writeQueue(nextQueue);
  return nextQueue;
}

export async function clearSyncedSyncActions(): Promise<PendingSyncAction[]> {
  const queue = await readQueue();
  const nextQueue = queue.filter((item) => item.status !== "synced");
  await writeQueue(nextQueue);
  return nextQueue;
}

export async function clearAllSyncActions(): Promise<void> {
  await AsyncStorage.removeItem(SYNC_QUEUE_KEY);
}

export async function setLastSyncedAt(value: string): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNCED_AT_KEY, value);
}

export async function getLastSyncedAt(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SYNCED_AT_KEY);
}
