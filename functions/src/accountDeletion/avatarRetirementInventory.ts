import { getFirestore } from "firebase-admin/firestore";
import type { Candidate } from "./deletionExecutionCore";

// Include retirement markers even when the parent user document is absent.
// A bounded incomplete result must block final account deletion.
export async function inventoryRetiredAvatars(uid: string): Promise<{ candidates: Candidate[]; complete: boolean }> {
  if (!uid || uid.includes("/")) throw new Error("Invalid user");
  const collection = getFirestore().collection("users").doc(uid).collection("retiredAvatars");
  const snapshot = await collection.limit(101).get();
  return {
    candidates: snapshot.docs.slice(0, 100).map(doc => ({ path: doc.ref.path, ownerIds: [uid], shared: false, retained: false })),
    complete: snapshot.size <= 100,
  };
}
