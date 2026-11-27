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
  // Storage may resolve after sign-out/account switch. Never report success
  // to a different active account; the write remains scoped to the original UID.
  if (currentUid() !== uid) throw new Error("Account changed while saving offline sync queue.");
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
  const actor = auth.currentUser;
  const uid = currentUid();
  // v2 is the only writer in this build. Retry non-destructive housekeeping on each queue entry.
  await cleanupEmptyLegacySyncQueue().catch(() => false);
  if (auth.currentUser !== actor) throw new Error("Account changed while reading offline sync queue.");
  await stageOwnedLegacyActionsForReview().catch(() => 0);
  if (auth.currentUser !== actor) throw new Error("Account changed while reading offline sync queue.");
  return readQueue(uid);
}

export async function savePendingSyncAction(action: PendingSyncAction): Promise<PendingSyncAction[]> {
  const requestedUid = currentUid();
  return serializeMutation(async () => {
    if (currentUid() !== requestedUid) throw new Error("Account changed while waiting to update offline sync queue.");
  if (action.userId !== currentUid()) throw new Error("Sync action owner does not match signed-in user.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = [action, ...queue.filter((item) => item.id !== action.id)];
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function updatePendingSyncAction(actionId: string, patch: Partial<PendingSyncAction>): Promise<PendingSyncAction[]> {
  const requestedUid = currentUid();
  return serializeMutation(async () => {
    if (currentUid() !== requestedUid) throw new Error("Account changed while waiting to update offline sync queue.");
  if (patch.userId !== undefined) throw new Error("Sync action owner cannot be changed.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.map((item) => (item.id === actionId ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item));
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function removePendingSyncAction(actionId: string): Promise<PendingSyncAction[]> {
  const requestedUid = currentUid();
  return serializeMutation(async () => {
    if (currentUid() !== requestedUid) throw new Error("Account changed while waiting to update offline sync queue.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.filter((item) => item.id !== actionId);
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function clearSyncedSyncActions(): Promise<PendingSyncAction[]> {
  const requestedUid = currentUid();
  return serializeMutation(async () => {
    if (currentUid() !== requestedUid) throw new Error("Account changed while waiting to update offline sync queue.");
  const uid = currentUid();
  const queue = await readQueue(uid);
  const nextQueue = queue.filter((item) => item.status !== "synced");
  await writeQueue(nextQueue, uid);
  return nextQueue;

  });
}

export async function clearAllSyncActions(): Promise<void> {
  const requestedUid = currentUid();
  return serializeMutation(async () => {
    if (currentUid() !== requestedUid) throw new Error("Account changed while waiting to update offline sync queue.");
    const uid = currentUid();
    if (currentUid() !== uid) throw new Error("Account changed during sync queue clear.");
    await AsyncStorage.removeItem(queueKey(uid));
    // A sign-out or account switch can occur while storage is resolving.
    // The deletion remains scoped to the captured UID, but must not be
    // reported as a successful clear for the newly active account.
    if (currentUid() !== uid) throw new Error("Account changed while clearing offline sync queue.");
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
  const actor = auth.currentUser;
  const uid = currentUid();
  const raw = await AsyncStorage.getItem(LEGACY_SYNC_QUEUE_KEY);
  if (auth.currentUser !== actor) throw new Error("Account changed during legacy inventory.");
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
    if (auth.currentUser !== actor) throw new Error("Account changed during legacy inventory.");
    return { total: items.length, currentUserCount, otherUserCount, missingOwnerCount, unreadable: false };
  } catch (error) {
    if (auth.currentUser !== actor) throw error;
    return { total: 0, currentUserCount: 0, otherUserCount: 0, missingOwnerCount: 0, unreadable: true };
  }
}

/** Remove only a provably empty legacy queue. Preserve all historical actions,
 * including ownerless or malformed records, until an explicit migration policy exists.
 * Call only after old writers have been retired; never use for active queues.
 */
export async function cleanupEmptyLegacySyncQueue(): Promise<boolean> {
  const actor = auth.currentUser;
  currentUid();
  return serializeMutation(async () => {
    if (auth.currentUser !== actor) throw new Error("Account changed during legacy cleanup.");
    const raw = await AsyncStorage.getItem(LEGACY_SYNC_QUEUE_KEY);
    if (auth.currentUser !== actor) throw new Error("Account changed during legacy cleanup.");
    if (raw === null) return false;
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return false; }
    if (!Array.isArray(parsed) || parsed.length !== 0) return false;
    if (await AsyncStorage.getItem(LEGACY_SYNC_QUEUE_KEY) !== raw) return false;
    if (auth.currentUser !== actor) throw new Error("Account changed during legacy cleanup.");
    await AsyncStorage.removeItem(LEGACY_SYNC_QUEUE_KEY);
    if (auth.currentUser !== actor) throw new Error("Account changed during legacy cleanup.");
    return true;
  });
}

/** Metadata-only inventory of known legacy storage families. No payloads or other UID keys are returned. */
export async function inspectLegacyLocalStorage(): Promise<{ legacyStepDays: number; legacyStepGoal: boolean; legacyQueue: boolean }> {
  const actor = auth.currentUser;
  currentUid();
  const keys = await AsyncStorage.getAllKeys();
  if (auth.currentUser !== actor) throw new Error("Account changed during legacy inventory.");
  return {
    legacyStepDays: keys.filter(key => /^@viora\/steps\/daily\/\d{4}-\d{2}-\d{2}$/.test(key)).length,
    legacyStepGoal: keys.includes("@viora/steps/goal"),
    legacyQueue: keys.includes(LEGACY_SYNC_QUEUE_KEY),
  };
}

/** Recover explicitly owned legacy records for review only, never automatically replay them.
 * The original device-wide queue stays quarantined. The review copy is idempotent
 * and never overwrites the live v2 queue or assigns ownerless records. */
export async function stageOwnedLegacyActionsForReview(): Promise<number> {
  const actor = auth.currentUser;
  const uid = currentUid();
  return serializeMutation(async () => {
    const check = () => { if (auth.currentUser !== actor) throw new Error("Account changed during legacy recovery."); };
    check();
    const raw = await AsyncStorage.getItem(LEGACY_SYNC_QUEUE_KEY);
    check();
    if (!raw) return 0;
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { return 0; }
    if (!Array.isArray(parsed)) return 0;
    const owned = parsed.filter(item => item && typeof item === "object" && item.userId === uid && typeof item.id === "string" && item.id.length > 0);
    const reviewKey = `@viora/sync-queue/legacy-review/${encodeURIComponent(uid)}`;
    const previous = await AsyncStorage.getItem(reviewKey);
    check();
    let existing: unknown = [];
    if (previous) existing = JSON.parse(previous);
    if (!Array.isArray(existing) || existing.some(item => !item || item.userId !== uid || typeof item.id !== "string")) throw new Error("Invalid legacy review copy; preserved.");
    const merged = new Map(existing.map(item => [item.id, item]));
    for (const item of owned) if (!merged.has(item.id)) merged.set(item.id, item);
    check();
    if (merged.size !== existing.length) await AsyncStorage.setItem(reviewKey, JSON.stringify([...merged.values()]));
    check();
    return merged.size;
  });
}
