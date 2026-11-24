/**
 * Conservative deletion execution core. Not exported as a production callable.
 * Adapter must provide a durable exclusive lease, write freeze and exhaustive inventory.
 */
export type Candidate = { path: string; ownerIds: string[]; shared: boolean; retained: boolean };
export type Inventory = { complete: boolean; candidates: Candidate[]; unresolved: string[] };
export interface DeletionAdapter {
  withExclusiveLease<T>(uid: string, run: () => Promise<T>): Promise<T>;
  assertAuthorizedAndFrozen(uid: string): Promise<void>;
  inventory(uid: string): Promise<Inventory>;
  eraseOwnedRecord(uid: string, candidate: Candidate): Promise<void>;
  eraseOwnedStorage(uid: string): Promise<void>;
  verifyStorageEmpty(uid: string): Promise<boolean>;
  checkpoint(uid: string, state: string): Promise<void>;
  eraseAuth(uid: string): Promise<void>;
}
export function planDeletion(uid: string, inventory: Inventory): Candidate[] {
  if (!uid || !inventory.complete || inventory.unresolved.length) throw Error("Incomplete inventory");
  const unique = new Map<string, Candidate>();
  for (const record of inventory.candidates) {
    if (record.shared || record.retained) continue;
    if (!record.path || !record.ownerIds.length || record.ownerIds.some(owner => owner !== uid)) {
      throw Error("Unverified ownership");
    }
    unique.set(record.path, record);
  }
  return [...unique.values()];
}
export async function executeDeletion(uid: string, adapter: DeletionAdapter) {
  return adapter.withExclusiveLease(uid, async () => {
    await adapter.assertAuthorizedAndFrozen(uid);
    const records = planDeletion(uid, await adapter.inventory(uid));
    await adapter.checkpoint(uid, "processing");
    try {
      for (const record of records.slice(0, 100)) {
        await adapter.eraseOwnedRecord(uid, record);
      }
      if (records.length > 100) return { complete: false };
      await adapter.eraseOwnedStorage(uid);
      if (planDeletion(uid, await adapter.inventory(uid)).length || !(await adapter.verifyStorageEmpty(uid))) {
        throw Error("Cleanup verification failed");
      }
      await adapter.checkpoint(uid, "auth_pending");
      await adapter.eraseAuth(uid);
      await adapter.checkpoint(uid, "completed");
      return { complete: true };
    } catch (error) {
      await adapter.checkpoint(uid, "retry_required");
      throw error;
    }
  });
}
