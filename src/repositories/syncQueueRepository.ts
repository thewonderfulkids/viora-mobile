import AsyncStorage from "@react-native-async-storage/async-storage";

import { PendingSyncAction } from "../types";
import { auth } from "../firebase/firebaseConfig";

// Legacy device-wide queue is intentionally quarantined: never replay or auto-migrate it.
const SYNC_QUEUE_KEY_PREFIX = "@viora/sync-queue/v2";
const LAST_SYNCED_AT_KEY_PREFIX = "@viora/sync-queue/v2/last-synced-at";

function currentUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Sign in to access your offline sync queue.");
  return uid;
}

function queueKey(uid: string) { return `${SYNC_QUEUE_KEY_PREFIX}/${uid}`; }
function syncedKey(uid: string) { return `${LAST_SYNCED_AT_KEY_PREFIX}/${uid}`; }

function sortByNewest(items: PendingSyncAction[]) {
  return [...items].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

async function readQueue(uid = currentUid()): Promise<PendingSyncAction[]> {
  const raw = await AsyncStorage.getItem(queueKey(uid));
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PendingSyncAction[];
    return Array.isArray(parsed) ? parsed.filter(item => item?.userId === uid) : [];
  } catch {
    return [];
  }
}

async function writeQueue(queue: PendingSyncAction[], uid = currentUid()) {
  if (currentUid() !== uid) throw new Error("Account changed during sync queue update.");
  if (queue.some(item => item.userId !== uid)) throw new Error("Cannot save another user\'s sync actions.");
  await AsyncStorage.setItem(queueKey(uid), JSON.stringify(sortByNewest(queue)));
}

export async function getPendingSyncActions(): Promise<PendingSyncAction[]> {
  return readQueue();
}

export async function savePendingSyncAction(action: PendingSyncAction): Promise<PendingSyncAction[]> {
  if (action.userId !== currentUid()) throw new Error("Sync action owner does not match signed-in user.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = [action, ...queue.filter((item) => item.id !== action.id)];
  await writeQueue(nextQueue, uid);
  return nextQueue;
}

export async function updatePendingSyncAction(actionId: string, patch: Partial<PendingSyncAction>): Promise<PendingSyncAction[]> {
  if (patch.userId !== undefined) throw new Error("Sync action owner cannot be changed.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.map((item) => (item.id === actionId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  await writeQueue(nextQueue, uid);
  return nextQueue;
}

export async function removePendingSyncAction(actionId: string): Promise<PendingSyncAction[]> {
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.filter((item) => item.id !== actionId);
  await writeQueue(nextQueue, uid);
  return nextQueue;
}

export async function clearSyncedSyncActions(): Promise<PendingSyncAction[]> {
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.filter((item) => item.status !== "synced");
  await writeQueue(nextQueue, uid);
  return nextQueue;
}

export async function clearAllSyncActions(): Promise<void> {
  await AsyncStorage.removeItem(queueKey(currentUid()));
}

export async function setLastSyncedAt(value: string): Promise<void> {
  await AsyncStorage.setItem(syncedKey(currentUid()), value);
}

export async function getLastSyncedAt(): Promise<string | null> {
  return AsyncStorage.getItem(syncedKey(currentUid()));
}
