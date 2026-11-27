import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

/**
 * Safe execution gate for account deletion.
 *
 * Destructive cleanup remains disabled until all Firestore collections,
 * nested subcollections, Storage buckets and retention obligations are audited.
 * This function records a recoverable preflight state only.
 */
export const prepareAccountDeletion = onCall(
  { region: "asia-south1", enforceAppCheck: false },
  async (request) => {
    const adminUid = request.auth?.uid;
    if (!adminUid) throw new HttpsError("unauthenticated", "Administrator sign-in required.");
    const admin = await getAuth().getUser(adminUid);
    const claims = admin.customClaims ?? {};
    if (admin.disabled || (claims.superAdmin !== true && claims.role !== "super_admin")) {
      throw new HttpsError("permission-denied", "Super Admin authorization required.");
    }

    const uid = String(request.data?.userId ?? "").trim();
    if (!uid || uid.length > 128 || uid.includes("/") || uid === adminUid) {
      throw new HttpsError("invalid-argument", "Valid target user ID required; self-deletion through admin tools is blocked.");
    }
    if (request.data?.confirmation !== `PREPARE:${uid}`) {
      throw new HttpsError("invalid-argument", "Explicit matching confirmation required.");
    }

    const db = getFirestore();
    const requestRef = db.doc(`accountDeletionRequests/${uid}`);
    const result = await db.runTransaction(async tx => {
      const actorLock = await tx.get(db.doc(`accountDeletionLocks/${adminUid}`));
      if (actorLock.exists) throw new HttpsError("failed-precondition", "Acting account deletion is in progress.");
      const lock = await tx.get(db.doc(`accountDeletionLocks/${uid}`));
      if (lock.exists) throw new HttpsError("failed-precondition", "Account deletion lock already exists.");
      const snap = await tx.get(requestRef);
      if (!snap.exists) throw new HttpsError("failed-precondition", "User has not requested deletion.");
      const data = snap.data() ?? {};
      if (data.status === "preflight") {
        return { status: "preflight", alreadyPrepared: true };
      }
      if (data.status !== "requested") {
        throw new HttpsError("failed-precondition", "Deletion request is not in a preparable state.");
      }
      tx.update(requestRef, {
        status: "preflight",
        preparedBy: adminUid,
        preparedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        cleanupStatus: "blocked_pending_inventory_audit",
        cleanupAttempts: 0,
        lastCleanupError: null,
      });
      return { status: "preflight", alreadyPrepared: false };
    });
    return {
      ...result,
      deletionPerformed: false,
      reason: "Full data inventory, retention review and recovery testing must be completed before destructive execution is enabled.",
    };
  }
);

/** Reset a preflight to requested without touching any user data. */
export const resetAccountDeletionPreflight = onCall(
  { region: "asia-south1", enforceAppCheck: false },
  async request => {
    const adminUid = request.auth?.uid;
    if (!adminUid) throw new HttpsError("unauthenticated", "Administrator sign-in required.");
    const admin = await getAuth().getUser(adminUid);
    const claims = admin.customClaims ?? {};
    if (admin.disabled || (claims.superAdmin !== true && claims.role !== "super_admin")) {
      throw new HttpsError("permission-denied", "Super Admin authorization required.");
    }
    const uid = String(request.data?.userId ?? "").trim();
    if (!uid || uid.length > 128 || uid.includes("/") || uid === adminUid) {
      throw new HttpsError("invalid-argument", "Valid target user ID required.");
    }
    const db = getFirestore();
    const ref = db.doc(`accountDeletionRequests/${uid}`);
    await db.runTransaction(async tx => {
      const actorLock = await tx.get(db.doc(`accountDeletionLocks/${adminUid}`));
      if (actorLock.exists) throw new HttpsError("failed-precondition", "Acting account deletion is in progress.");
      const lock = await tx.get(db.doc(`accountDeletionLocks/${uid}`));
      if (lock.exists) throw new HttpsError("failed-precondition", "Active deletion lock requires recovery review.");
      const snap = await tx.get(ref);
      if (!snap.exists || snap.data()?.status !== "preflight") {
        throw new HttpsError("failed-precondition", "No deletion preflight to reset.");
      }
      tx.update(ref, {
        status: "requested",
        cleanupStatus: "not_started",
        updatedAt: FieldValue.serverTimestamp(),
        resetBy: adminUid,
        resetAt: FieldValue.serverTimestamp(),
      });
    });
    return { status: "requested", deletionPerformed: false };
  }
);
