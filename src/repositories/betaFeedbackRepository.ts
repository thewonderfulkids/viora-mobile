import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { BetaFeedbackRecord } from "../types";

export async function createBetaFeedbackRecord(record: BetaFeedbackRecord): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.betaFeedback), {
    ...record,
    serverUpdatedAt: serverTimestamp(),
  });

  return ref.id;
}
