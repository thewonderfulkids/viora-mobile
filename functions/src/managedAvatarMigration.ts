import { getFirestore } from "firebase-admin/firestore";

// Internal opt-in only after the deployed client and private reader have
// passed device validation. Never migrate users merely by running cleanup.
export async function enableManagedAvatarProfile(uid: string, expectedPhoto: string | null, clientVerified: boolean): Promise<boolean> {
  if (!clientVerified || !uid || uid.includes("/")) return false;
  const db = getFirestore();
  const user = db.collection("users").doc(uid);
  const freeze = db.collection("accountDeletionLocks").doc(uid);
  return db.runTransaction(async tx => {
    const [snapshot, deletion] = await Promise.all([tx.get(user), tx.get(freeze)]);
    const data = snapshot.data();
    if (!data || deletion.exists || data.avatarCleanupLocked === true ||
        (data.photoURL ?? null) !== expectedPhoto) return false;
    if (data.avatarServerManaged === true) return true;
    tx.update(user, { avatarServerManaged: true });
    return true;
  });
}
