import { randomUUID } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { AvatarCleanupStore, AvatarCleanupLease } from "./avatarCleanupWorker";

// Deliberately not wired to a trigger. Only profiles migrated to a trusted
// reference writer may be cleaned. Crash recovery must not steal a live lock.
export function firebaseAvatarCleanupStore(): AvatarCleanupStore {
  const db = getFirestore();
  const bucket = getStorage().bucket();
  return {
    async acquire(uid): Promise<AvatarCleanupLease | null> {
      const ref = db.collection("users").doc(uid);
      const freeze = db.collection("accountDeletionLocks").doc(uid);
      const token = randomUUID();
      const profile = await db.runTransaction(async tx => {
        const [user, deletion] = await Promise.all([tx.get(ref), tx.get(freeze)]);
        const data = user.data();
        if (!data || deletion.exists || data.avatarServerManaged !== true || data.avatarCleanupLocked === true) return null;
        tx.update(ref, { avatarCleanupLocked: true, avatarCleanupToken: token });
        return data;
      });
      if (!profile) return null;
      const verify = async () => {
        const snapshot = await ref.get();
        if (snapshot.get("avatarCleanupToken") !== token || snapshot.get("avatarCleanupLocked") !== true || snapshot.get("avatarServerManaged") !== true) throw new Error("Avatar cleanup lease lost");
      };
      return {
        profile, bucket: bucket.name,
        async listCandidates() {
          await verify();
          const [files] = await bucket.getFiles({ prefix: "profile-photos/" + uid + "/", autoPaginate: false, maxResults: 100 });
          return files.map(file => ({
            name: file.name,
            generation: String(file.metadata.generation ?? ""),
            timeCreated: file.metadata.timeCreated,
            contentType: file.metadata.contentType,
            metadata: file.metadata.metadata,
          }));
        },
        async retireReference(candidate) {
          await db.runTransaction(async tx => {
            const snapshot = await tx.get(ref);
            if (snapshot.get("avatarCleanupToken") !== token || snapshot.get("avatarCleanupLocked") !== true || snapshot.get("avatarServerManaged") !== true) throw new Error("Avatar cleanup lease lost");
            // Durable marker, retained even if deletion fails.
            tx.set(ref.collection("retiredAvatars").doc(candidate.name.split("/").pop()!), { generation: candidate.generation, retiredAt: new Date().toISOString() });
          });
        },
        async deleteGeneration(candidate) {
          await verify();
          if (!candidate.generation) throw new Error("Missing object generation");
          await bucket.file(candidate.name).delete({ ifGenerationMatch: candidate.generation, ignoreNotFound: true });
        },
        async release() {
          await db.runTransaction(async tx => {
            const snapshot = await tx.get(ref);
            if (snapshot.get("avatarCleanupToken") === token) tx.update(ref, { avatarCleanupLocked: false, avatarCleanupToken: null });
          });
        },
      };
    },
  };
}
