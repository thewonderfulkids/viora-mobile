import { FieldPath, getFirestore } from "firebase-admin/firestore";
import type { Candidate } from "./deletionExecutionCore";

// Include retirement markers even when the parent user document is absent.
// A bounded incomplete result must block final account deletion.
export async function inventoryRetiredAvatars(uid: string): Promise<{ candidates: Candidate[]; complete: boolean }> {
  if (!uid || uid.includes("/")) throw new Error("Invalid user");
  const collection = getFirestore().collection("users").doc(uid).collection("retiredAvatars");
  const candidates: Candidate[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 100; page++) {
    const query = collection.orderBy(FieldPath.documentId()).limit(100);
    const snapshot = await (cursor ? query.startAfter(cursor) : query).get();
    for (const doc of snapshot.docs) candidates.push({ path: doc.ref.path, ownerIds: [uid], shared: false, retained: false });
    if (snapshot.size < 100) return { candidates, complete: true };
    cursor = snapshot.docs[snapshot.docs.length - 1].id;
  }
  return { candidates, complete: false };
}
