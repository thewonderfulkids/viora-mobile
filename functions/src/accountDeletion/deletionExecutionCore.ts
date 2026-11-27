/**
 * Conservative deletion execution core. Not exported as a production callable.
 * Adapter must provide a durable exclusive lease, write freeze and exhaustive inventory.
 */
import { classifyRetention } from "./retentionPolicy";

export type Candidate = { path: string; ownerIds: string[]; shared: boolean; retained: boolean };
export type Inventory = { complete: boolean; candidates: Candidate[]; unresolved: string[] };
export type DeletionCheckpoint = "processing" | "retry_required" | "auth_pending" | "completed";

export function isExistingDeletionRequest(status: unknown): status is "requested" | "preflight" | DeletionCheckpoint {
  return status === "requested" || status === "preflight" || status === "processing" ||
    status === "retry_required" || status === "auth_pending" || status === "completed";
}

export interface DeletionAdapter {
  withExclusiveLease<T>(uid: string, run: () => Promise<T>): Promise<T>;
  // Must authenticate this durable attempt, verify its freeze, and bind it to the
  // original account generation. Recovery must work without the original Auth
  // record, but must reject a recreated/rebound account.
  assertAuthorizedAndFrozen(uid: string, phase: "cleanup" | "auth_pending" | "completed"): Promise<void>;
  readCheckpoint(uid: string): Promise<DeletionCheckpoint | null>;
  inventory(uid: string): Promise<Inventory>;
  eraseOwnedRecord(uid: string, candidate: Candidate): Promise<void>;
  eraseOwnedStorage(uid: string): Promise<void>;
  verifyStorageEmpty(uid: string): Promise<boolean>;
  checkpoint(uid: string, state: DeletionCheckpoint): Promise<void>;
  // Under the same attempt/lease, absence of that Auth record is already
  // success. Only a confirmed not-found may be treated as success.
  eraseAuthIfPresent(uid: string): Promise<void>;
}
export function planDeletion(uid: string, inventory: Inventory): Candidate[] {
  if (!uid || !inventory.complete || inventory.unresolved.length) throw Error("Incomplete inventory");
  const unique = new Map<string, Candidate>();
  const protectedPaths = new Set<string>();
  for (const record of inventory.candidates) {
    if (!record.path) throw Error("Unverified record path");
    const segments = record.path.split("/");
    if (segments.length % 2 !== 0 || segments.some(segment => !segment || segment === "." || segment === "..")) {
      throw Error("Unverified record path");
    }
    // Check every collection segment, including descendants of protected records.
    const policyProtected = segments.some((segment, index) =>
      index % 2 === 0 && classifyRetention(segment) !== "unclassified");
    if (policyProtected && !record.shared && !record.retained) {
      throw Error("Retention policy review required");
    }
    if (record.shared || record.retained) {
      protectedPaths.add(record.path);
      continue;
    }
    if (!record.ownerIds.length || record.ownerIds.some(owner => owner !== uid)) {
      throw Error("Unverified ownership");
    }
    if (segments[0] === "users" && segments[2] === "retiredAvatars" &&
        (segments.length !== 4 || segments[1] !== uid || !/^avatar-[0-9]+\.jpg$/.test(segments[3]))) {
      throw Error("Unverified avatar retirement ownership");
    }
    unique.set(record.path, record);
  }
  for (const path of protectedPaths) {
    if (unique.has(path)) throw Error("Conflicting deletion evidence");
  }
  return [...unique.values()].sort((a, b) => b.path.split("/").length - a.path.split("/").length);
}
export async function executeDeletion(uid: string, adapter: DeletionAdapter) {
  if (!uid) throw Error("Missing deletion user");
  return adapter.withExclusiveLease(uid, async () => {
    const state = await adapter.readCheckpoint(uid);
    if (state !== null && !["processing", "retry_required", "auth_pending", "completed"].includes(state)) {
      throw Error("Unknown deletion checkpoint");
    }
    if (state === "completed") {
      await adapter.assertAuthorizedAndFrozen(uid, "completed");
      return { complete: true };
    }
    if (state === "auth_pending") {
      await adapter.assertAuthorizedAndFrozen(uid, "auth_pending");
    } else {
      await adapter.assertAuthorizedAndFrozen(uid, "cleanup");
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
      } catch (error) {
        await adapter.checkpoint(uid, "retry_required");
        throw error;
      }
      // This write may be committed even if its caller sees an error. Never
      // replace the durable marker with a generic retry state after this point.
      await adapter.checkpoint(uid, "auth_pending");
    }
    await adapter.eraseAuthIfPresent(uid);
    await adapter.checkpoint(uid, "completed");
    return { complete: true };
  });
}
