import { doc, getDocFromServer, runTransaction } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/firebaseConfig";
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
  assertCurrent();
  const current = await getDocFromServer(ref);
  assertCurrent();
  if (current.data()?.avatarServerManaged === true) {
    const baseline = expectedPhoto === undefined ? current.data()?.photoURL ?? null : expectedPhoto;
    let path = photoURL;
    if (photoURL.startsWith("https://")) {
      const url = new URL(photoURL);
      const prefix = "/v0/b/viora-9021a.firebasestorage.app/o/";
      if (url.origin !== "https://firebasestorage.googleapis.com" || !url.pathname.startsWith(prefix)) throw new Error("Invalid avatar reference");
      path = decodeURIComponent(url.pathname.slice(prefix.length));
    }
    if (!path.startsWith("profile-photos/" + uid + "/")) throw new Error("Managed avatar requires a storage upload");
    await httpsCallable(functions, "publishProfileAvatar")({ path, expectedPhoto: baseline });
    assertCurrent();
    return;
  }
  await runTransaction(db, async transaction => {
    assertCurrent();
    const snapshot = await transaction.get(ref);
    assertCurrent();
    if (snapshot.data()?.avatarServerManaged === true) throw new Error("Profile photo settings changed. Please retry.");
    if (expectedPhoto !== undefined && (snapshot.data()?.photoURL ?? null) !== expectedPhoto) {
      throw new Error("Profile photo changed on another device. Please try again.");
    }
    transaction.set(ref, { uid, photoURL, updatedAt: new Date().toISOString() }, { merge: true });
  });
}
