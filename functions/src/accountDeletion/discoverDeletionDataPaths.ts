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
    if (admin.disabled || (claims.superAdmin !== true && claims.role !== "super_admin")) {
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

    const target = await getAuth().getUser(uid);
    const identity = target.metadata.creationTime;
    if (!identity || !Number.isFinite(Date.parse(identity)) ||
        deletion.data()?.userId !== uid || deletion.data()?.authCreationTime !== identity) {
      throw new HttpsError("failed-precondition", "Deletion request account identity mismatch or legacy request; manual review required.");
    }
    if ((await db.doc(`accountDeletionLocks/${adminUid}`).get()).exists) {
      throw new HttpsError("failed-precondition", "Acting account deletion is in progress.");
    }
    const topLevel = await db.listCollections();
    const collectionNames = topLevel.map(item => item.id).sort();
    const uidDocumentPaths: string[] = [];
    const nestedCollectionPaths: string[] = [];
    const errors: string[] = [];
    const MAX_COLLECTIONS = 150;
    const MAX_NESTED = 500;
    const inspected = topLevel.slice(0, MAX_COLLECTIONS);

    const MAX_DOCUMENTS = 1000;
    const MAX_DEPTH = 5;
    let inspectedNestedDocuments = 0;
    let nestedTruncated = false;
    async function visit(ref: FirebaseFirestore.DocumentReference, depth: number): Promise<void> {
      const children = await ref.listCollections();
      for (const child of children) {
        if (nestedCollectionPaths.length >= MAX_NESTED) {
          nestedTruncated = true;
          return;
        }
        nestedCollectionPaths.push(child.path);
        if (depth >= MAX_DEPTH || inspectedNestedDocuments >= MAX_DOCUMENTS) {
          nestedTruncated = true;
          continue;
        }
        // listDocuments includes missing parent documents with surviving descendants.
        const refs = await child.listDocuments();
        for (const nested of refs) {
          if (inspectedNestedDocuments >= MAX_DOCUMENTS || nestedCollectionPaths.length >= MAX_NESTED) {
            nestedTruncated = true;
            break;
          }
          inspectedNestedDocuments++;
          await visit(nested, depth + 1);
        }
      }
    }
    for (const collection of inspected) {
      try {
        const ref = collection.doc(uid);
        const snapshot = await ref.get();
        if (snapshot.exists) uidDocumentPaths.push(ref.path);
        await visit(ref, 1);
      } catch {
        errors.push(`${collection.id}: Discovery failed`);
      }
    }

    return {
      userId: uid,
      collectionNames,
      uidDocumentPaths,
      nestedCollectionPaths,
      inspectedTopLevelCollections: inspected.length,
      inspectedNestedDocuments,
      truncated: nestedTruncated || topLevel.length > MAX_COLLECTIONS || nestedCollectionPaths.length >= MAX_NESTED,
      errors,
      complete: false,
      deletionPerformed: false,
      warning: "Discovery is read-only and incomplete. It does not enumerate random-ID documents, all descendants, collection-group matches, shared-family links, or other Storage prefixes. Never use this alone to authorize deletion.",
    };
  }
);
