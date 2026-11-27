import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Internal writer only. The callable boundary must derive uid from verified auth.
// No existing profile is migrated implicitly by this helper.
export async function publishManagedAvatar(uid: string, path: string, expectedPhoto: string | null): Promise<string> {
  if (!uid || uid.includes("/") || !path.startsWith("profile-photos/" + uid + "/")) throw new Error("Invalid avatar owner");
  const name = path.slice(("profile-photos/" + uid + "/").length);
  if (!/^avatar-[0-9]+\.jpg$/.test(name)) throw new Error("Invalid avatar path");
  const bucket = getStorage().bucket();
  const [metadata] = await bucket.file(path).getMetadata();
  if (metadata.contentType !== "image/jpeg" || metadata.metadata?.uid !== uid ||
      metadata.metadata?.source !== "viora-mobile-profile-avatar" ||
      !Number.isFinite(Number(metadata.size)) || Number(metadata.size) <= 0 ||
      Number(metadata.size) >= 5 * 1024 * 1024) throw new Error("Invalid avatar object");
  const db = getFirestore();
  const user = db.collection("users").doc(uid);
  const retired = user.collection("retiredAvatars").doc(name);
  const freeze = db.collection("accountDeletionLocks").doc(uid);
  await db.runTransaction(async tx => {
    const [profile, marker, deletion] = await Promise.all([tx.get(user), tx.get(retired), tx.get(freeze)]);
    const data = profile.data();
    if (!data || data.avatarServerManaged !== true || data.avatarCleanupLocked === true || deletion.exists || marker.exists) throw new Error("Avatar publication unavailable");
    if ((data.photoURL ?? null) !== expectedPhoto) throw new Error("Profile photo changed on another device");
    tx.update(user, { photoURL: path, photoUrl: path, avatarUrl: path, updatedAt: new Date().toISOString() });
  });
  return path;
}
