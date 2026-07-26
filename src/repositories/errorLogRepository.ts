import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";
import { ClientErrorLogRecord } from "../types";

export async function createClientErrorLog(record: ClientErrorLogRecord): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.clientErrorLogs), {
    ...record,
    serverUpdatedAt: serverTimestamp(),
  });

  return ref.id;
}
