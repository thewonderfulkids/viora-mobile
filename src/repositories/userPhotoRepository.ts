import { doc, setDoc } from "firebase/firestore";

import { db } from "../firebase/firebaseConfig";
import { COLLECTIONS } from "../firebase/firestoreCollections";

export async function updateUserPhoto(uid: string, photoURL: string) {
  const ref = doc(db, COLLECTIONS.users, uid);

  await setDoc(
    ref,
    {
      uid,
      photoURL,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}