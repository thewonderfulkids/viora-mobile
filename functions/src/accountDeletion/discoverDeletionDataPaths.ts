import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

/**
 * Bounded read-only discovery of collection names and nested collections
 * beneath known UID documents. Does not read or return document contents.
 */
export const discoverDeletionDataPaths = onCall(
  { region: "asia-south1", enforceAppCheck: false, timeoutSeconds: 120 },
  async request => {
    const adminUid = request.auth?.uid;
    if (!adminUid) throw new HttpsError("unauthenticated", "Administrator sign-in required.");
    const admin = await getAuth().getUser(adminUid);
    const claims = admin.customClaims ?? {};
    if (claims.superAdmin !== true && claims.role !== "super_admin") {
      throw new HttpsError("permission-denied", "Super Admin required.");
    }

    const uid = String(request.data?.userId ?? "").trim();
    if (!uid || uid.length > 128 || uid.includes("/") || uid === adminUid) {
      throw new HttpsError("invalid-argument", "Valid target user ID required.");
    }

    const db = getFirestore();
    const deletion = await db.doc(`accountDeletionRequests/${uid}`).get();
    if (!deletion.exists || !["requested", "preflight"].includes(String(deletion.data()?.status))) {
      throw new HttpsError("failed-precondition", "An active deletion request is required.");
    }

    const topLevel = await db.listCollections();
    const collectionNames = topLevel.map(item => item.id).sort();
    const uidDocumentPaths: string[] = [];
    const nestedCollectionPaths: string[] = [];
    const errors: string[] = [];
    const MAX_COLLECTIONS = 150;
    const MAX_NESTED = 500;
    const inspected = topLevel.slice(0, MAX_COLLECTIONS);

    for (const collection of inspected) {
      try {
        const ref = collection.doc(uid);
        const snapshot = await ref.get();
        if (!snapshot.exists) continue;
        uidDocumentPaths.push(ref.path);
        const children = await ref.listCollections();
        for (const child of children) {
          if (nestedCollectionPaths.length >= MAX_NESTED) break;
          nestedCollectionPaths.push(child.path);
        }
      } catch (error) {
        errors.push(`${collection.id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return {
      userId: uid,
      collectionNames,
      uidDocumentPaths,
      nestedCollectionPaths,
      inspectedTopLevelCollections: inspected.length,
      truncated: topLevel.length > MAX_COLLECTIONS || nestedCollectionPaths.length >= MAX_NESTED,
      errors,
      complete: false,
      deletionPerformed: false,
      warning: "Discovery is read-only and incomplete. It does not enumerate random-ID documents, all descendants, collection-group matches, shared-family links, or other Storage prefixes. Never use this alone to authorize deletion.",
    };
  }
);
