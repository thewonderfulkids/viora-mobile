import { doc, getDocFromServer, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";

export async function readUserPhotoBaseline(uid: string): Promise<string | null> {
  const snapshot = await getDocFromServer(doc(db, COLLECTIONS.users, uid));
  return snapshot.data()?.photoURL ?? null;
}

export async function updateUserPhoto(
  uid: string, photoURL: string, expectedPhoto?: string | null,
  assertCurrent: () => void = () => {},
) {
  const ref = doc(db, COLLECTIONS.users, uid);
  await runTransaction(db, async transaction => {
    assertCurrent();
    const snapshot = await transaction.get(ref);
    assertCurrent();
    if (expectedPhoto !== undefined && (snapshot.data()?.photoURL ?? null) !== expectedPhoto) {
      throw new Error("Profile photo changed on another device. Please try again.");
    }
    transaction.set(ref, { uid, photoURL, updatedAt: new Date().toISOString() }, { merge: true });
  });
}
