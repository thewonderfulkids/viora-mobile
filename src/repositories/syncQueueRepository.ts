import AsyncStorage from "@react-native-async-storage/async-storage";

import { PendingSyncAction } from "../types";
import { auth } from "../firebase/firebaseConfig";

// Legacy device-wide queue is intentionally quarantined: never replay or auto-migrate it.
const LEGACY_SYNC_QUEUE_KEY = "@viora/sync-queue/v1";
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
  // Auth may change while AsyncStorage is resolving. Never return a previous
  // account's offline actions to the newly signed-in account.
  if (currentUid() !== uid) throw new Error("Account changed while reading offline sync queue.");
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Never replace an unreadable queue with an empty one: that would erase
    // offline changes on the next save.
    throw new Error("Offline sync queue is unreadable. Existing data has been preserved.");
  }
  if (!Array.isArray(parsed)) {
    throw new Error("Offline sync queue has an invalid format. Existing data has been preserved.");
  }
  if (parsed.some(item => !item || typeof item !== "object" || item.userId !== uid)) {
    // Fail closed rather than silently dropping entries and then overwriting
    // the original queue on the next mutation.
    throw new Error("Offline sync queue contains invalid or mismatched ownership. Existing data has been preserved.");
  }
  return parsed as PendingSyncAction[];
}

async function writeQueue(queue: PendingSyncAction[], uid = currentUid()) {
  if (currentUid() !== uid) throw new Error("Account changed during sync queue update.");
  if (queue.some(item => item.userId !== uid)) throw new Error("Cannot save another user\'s sync actions.");
  await AsyncStorage.setItem(queueKey(uid), JSON.stringify(sortByNewest(queue)));
}

// Serialize read-modify-write operations within this app process so concurrent
// offline actions cannot overwrite each other. Failures must not poison the chain.
let mutationTail: Promise<void> = Promise.resolve();
function serializeMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationTail.then(operation);
  mutationTail = result.then(() => undefined, () => undefined);
  return result;
}

export async function getPendingSyncActions(): Promise<PendingSyncAction[]> {
  return readQueue();
}

export async function savePendingSyncAction(action: PendingSyncAction): Promise<PendingSyncAction[]> {
  return serializeMutation(async () => {
  if (action.userId !== currentUid()) throw new Error("Sync action owner does not match signed-in user.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = [action, ...queue.filter((item) => item.id !== action.id)];
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function updatePendingSyncAction(actionId: string, patch: Partial<PendingSyncAction>): Promise<PendingSyncAction[]> {
  return serializeMutation(async () => {
  if (patch.userId !== undefined) throw new Error("Sync action owner cannot be changed.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.map((item) => (item.id === actionId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function removePendingSyncAction(actionId: string): Promise<PendingSyncAction[]> {
  return serializeMutation(async () => {
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.filter((item) => item.id !== actionId);
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function clearSyncedSyncActions(): Promise<PendingSyncAction[]> {
  return serializeMutation(async () => {
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.filter((item) => item.status !== "synced");
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function clearAllSyncActions(): Promise<void> {
  return serializeMutation(async () => {
    const uid = currentUid();
    if (currentUid() !== uid) throw new Error("Account changed during sync queue clear.");
    await AsyncStorage.removeItem(queueKey(uid));
  });
}

export async function setLastSyncedAt(value: string): Promise<void> {
  const uid = currentUid();
  await AsyncStorage.setItem(syncedKey(uid), value);
  if (currentUid() !== uid) throw new Error("Account changed while saving sync timestamp.");
}

export async function getLastSyncedAt(): Promise<string | null> {
  const uid = currentUid();
  const value = await AsyncStorage.getItem(syncedKey(uid));
  if (currentUid() !== uid) throw new Error("Account changed while reading sync timestamp.");
  return value;
}

/** Read-only legacy inventory; never migrates, replays or deletes device-wide data. */
export async function inspectLegacySyncQueue(): Promise<{
  total: number;
  currentUserCount: number;
  otherUserCount: number;
  missingOwnerCount: number;
  unreadable: boolean;
}> {
  const uid = currentUid();
  const raw = await AsyncStorage.getItem(LEGACY_SYNC_QUEUE_KEY);
  if (!raw) return { total: 0, currentUserCount: 0, otherUserCount: 0, missingOwnerCount: 0, unreadable: false };
  try {
    const items: unknown = JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error("Invalid legacy queue");
    let currentUserCount = 0;
    let otherUserCount = 0;
    let missingOwnerCount = 0;
    for (const item of items) {
      const owner = item && typeof item === "object" && "userId" in item
        ? (item as { userId?: unknown }).userId : undefined;
      if (owner === uid) currentUserCount++;
      else if (typeof owner === "string" && owner.length > 0) otherUserCount++;
      else missingOwnerCount++;
    }
    if (uid !== currentUid()) throw new Error("Account changed during legacy inventory.");
    return { total: items.length, currentUserCount, otherUserCount, missingOwnerCount, unreadable: false };
  } catch (error) {
    if (uid !== auth.currentUser?.uid) throw error;
    return { total: 0, currentUserCount: 0, otherUserCount: 0, missingOwnerCount: 0, unreadable: true };
  }
}
