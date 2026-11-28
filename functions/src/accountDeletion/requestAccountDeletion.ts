import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { isExistingDeletionRequest } from "./deletionExecutionCore";

/**
 * Creates an authenticated deletion request. This does not delete data.
 * The account remains accessible until a verified deletion worker is deployed.
 */
export const requestAccountDeletion = onCall(
  { region: "asia-south1", enforceAppCheck: false },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Sign in to request account deletion.");

    const authTime = Number(request.auth?.token.auth_time ?? 0);
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (!Number.isSafeInteger(authTime) || authTime <= 0 || authTime > nowSeconds || nowSeconds - authTime > 300) {
      throw new HttpsError("failed-precondition", "Recent sign-in required. Sign out and sign in again before requesting deletion.");
    }

    const user = await getAuth().getUser(uid);
    if (user.disabled) throw new HttpsError("failed-precondition", "Account is disabled.");

    const validAfter = Date.parse(user.tokensValidAfterTime ?? "");
    if (!Number.isFinite(validAfter) || authTime < Math.floor(validAfter / 1000)) {
      throw new HttpsError("failed-precondition", "Recent sign-in required. Sign out and sign in again before requesting deletion.");
    }

    const creationTime = user.metadata.creationTime;
    if (!creationTime || !Number.isFinite(Date.parse(creationTime))) {
      throw new HttpsError("failed-precondition", "Account identity could not be verified.");
    }
    const db = getFirestore();
    const ref = db.doc(`accountDeletionRequests/${uid}`);
    const result = await db.runTransaction(async (tx) => {
      const lock = await tx.get(db.doc(`accountDeletionLocks/${uid}`));
      const previous = await tx.get(ref);
      const status = previous.data()?.status;
      if (isExistingDeletionRequest(status)) {
        if (previous.data()?.userId !== uid || previous.data()?.authCreationTime !== creationTime) {
          throw new HttpsError("failed-precondition", "Deletion request account identity mismatch; manual review required.");
        }
        return { status, alreadyRequested: true };
      }
      if (lock.exists) throw new HttpsError("failed-precondition", "Account deletion is already in progress; recovery review required.");
      tx.set(ref, {
        userId: uid,
        authCreationTime: creationTime,
        email: user.email ?? null,
        status: "requested",
        requestedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        source: "authenticated_user",
        requiresManualReview: true,
      });
      return { status: "requested", alreadyRequested: false };
    });
    return result;
  }
);
