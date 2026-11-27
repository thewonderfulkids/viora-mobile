import { AvatarCandidate, selectOrphanAvatars } from "./avatarCleanupCandidates";

// Adapter must atomically acquire an exclusive, durable lock and prevent
// retired references from being published even after the lock is released.
export interface AvatarCleanupLease {
  profile: Record<string, unknown>;
  bucket: string;
  listCandidates(): Promise<AvatarCandidate[]>;
  retireReference(candidate: AvatarCandidate): Promise<void>;
  deleteGeneration(candidate: AvatarCandidate): Promise<void>;
  release(): Promise<void>;
}

export interface AvatarCleanupStore {
  acquire(uid: string): Promise<AvatarCleanupLease | null>;
}

// Not exported as a deployed function until the production adapter and rules
// enforce retirement for every reference writer.
export async function runAvatarCleanup(
  store: AvatarCleanupStore, uid: string, now = Date.now(),
): Promise<{ deleted: number; failed: number; skipped: boolean }> {
  if (!uid || uid.includes("/")) return { deleted: 0, failed: 0, skipped: true };
  const lease = await store.acquire(uid);
  if (!lease) return { deleted: 0, failed: 0, skipped: true };
  let deleted = 0;
  let failed = 0;
  try {
    const candidates = selectOrphanAvatars(uid, lease.bucket, lease.profile, await lease.listCandidates(), now);
    for (const candidate of candidates.slice(0, 100)) {
      try {
        // Persist retirement before deletion; failures must never remove the
        // retirement marker. The adapter must use a generation precondition.
        await lease.retireReference(candidate);
        await lease.deleteGeneration(candidate);
        deleted++;
      } catch {
        failed++;
      }
    }
    return { deleted, failed, skipped: false };
  } finally {
    await lease.release();
  }
}
