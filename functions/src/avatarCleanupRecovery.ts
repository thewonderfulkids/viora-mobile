import { getFirestore } from "firebase-admin/firestore";

// Internal recovery only: caller must independently establish that the old
// worker has terminated. Age alone cannot prove that a Storage delete is idle.
export async function recoverStoppedAvatarCleanup(uid: string, expectedToken: string, workerConfirmedStopped: boolean): Promise<boolean> {
  if (!workerConfirmedStopped || !uid || uid.includes("/") || !expectedToken) return false;
  const db = getFirestore();
  const ref = db.collection("users").doc(uid);
  return db.runTransaction(async tx => {
    const snapshot = await tx.get(ref);
    if (!snapshot.exists || snapshot.get("avatarCleanupLocked") !== true ||
        snapshot.get("avatarCleanupToken") !== expectedToken) return false;
    tx.update(ref, { avatarCleanupLocked: false, avatarCleanupToken: null, avatarCleanupStartedAt: null });
    return true;
  });
}
