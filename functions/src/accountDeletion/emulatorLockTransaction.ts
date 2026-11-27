import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getApp } from "firebase-admin/app";
import { assertLockCandidate } from "./productionLockPolicy";

/** Emulator-only rehearsal; never export as a deployed callable. */
export async function freezeFixtureAccount(uid: string, actorUid: string): Promise<void> {
  const app = getApp();
  if (app.options.projectId !== "demo-viora-deletion" ||
      process.env.GCLOUD_PROJECT !== "demo-viora-deletion" ||
      !["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST", "FIREBASE_STORAGE_EMULATOR_HOST"].every(
        key => /^(localhost|127\.0\.0\.1):\d+$/.test(process.env[key] ?? "")) ||
      !/^fixture-[a-zA-Z0-9-]+$/.test(uid) ||
      !/^fixture-[a-zA-Z0-9-]+$/.test(actorUid) || uid === actorUid) {
    throw new Error("Isolated fixture environment required");
  }
  const auth = getAuth(app);
  const [actor, target] = await Promise.all([auth.getUser(actorUid), auth.getUser(uid)]);
  if (actor.disabled || actor.customClaims?.superAdmin !== true) {
    throw new Error("Fixture super admin required");
  }
  const db = getFirestore(app);
  const lock = db.doc("accountDeletionLocks/" + uid);
  const request = db.doc("accountDeletionRequests/" + uid);
  await db.runTransaction(async tx => {
    const actorLock = await tx.get(db.doc("accountDeletionLocks/" + actorUid));
    const existing = await tx.get(lock);
    const prepared = await tx.get(request);
    assertLockCandidate({
      uid, authCreationTime: target.metadata.creationTime,
      request: prepared.data() ?? {},
      existingLock: existing.exists, actorLocked: actorLock.exists,
    });
    tx.create(lock, {
      userId: uid, authCreationTime: target.metadata.creationTime,
      frozen: true, leased: false, leaseToken: null,
      createdBy: actorUid, createdAt: FieldValue.serverTimestamp(),
      state: "frozen_fixture",
    });
    tx.update(request, {
      cleanupStatus: "frozen_fixture", updatedAt: FieldValue.serverTimestamp(),
    });
  });
}
