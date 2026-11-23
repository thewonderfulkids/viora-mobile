import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

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
    if (!authTime || Date.now() / 1000 - authTime > 300) {
      throw new HttpsError("failed-precondition", "Recent sign-in required. Sign out and sign in again before requesting deletion.");
    }

    const user = await getAuth().getUser(uid);
    if (user.disabled) throw new HttpsError("failed-precondition", "Account is disabled.");

    const db = getFirestore();
    const ref = db.doc(`accountDeletionRequests/${uid}`);
    const result = await db.runTransaction(async (tx) => {
      const previous = await tx.get(ref);
      if (previous.exists && ["requested", "preflight", "processing"].includes(String(previous.data()?.status))) {
        return { status: String(previous.data()?.status), alreadyRequested: true };
      }
      tx.set(ref, {
        userId: uid,
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
