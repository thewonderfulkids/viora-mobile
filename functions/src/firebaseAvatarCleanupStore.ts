import { randomUUID } from "node:crypto";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { AvatarCleanupStore, AvatarCleanupLease } from "./avatarCleanupWorker";
import { selectOrphanAvatars } from "./avatarCleanupCandidates";

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
        tx.update(ref, { avatarCleanupLocked: true, avatarCleanupToken: token, avatarCleanupStartedAt: new Date().toISOString() });
        return data;
      });
      if (!profile) return null;
      const verify = async () => {
        const [snapshot, deletion] = await Promise.all([ref.get(), freeze.get()]);
        if (deletion.exists || snapshot.get("avatarCleanupToken") !== token || snapshot.get("avatarCleanupLocked") !== true || snapshot.get("avatarServerManaged") !== true) throw new Error("Avatar cleanup lease lost");
      };
      return {
        profile, bucket: bucket.name,
        async listCandidates() {
          await verify();
          const files: import("@google-cloud/storage").File[] = [];
          let pageToken: string | undefined;
          const seen = new Set<string>();
          do {
            await verify();
            const [page, next] = await bucket.getFiles({ prefix: "profile-photos/" + uid + "/", autoPaginate: false, maxResults: 100, pageToken });
            files.push(...page);
            const nextToken = next?.pageToken;
            if (nextToken && seen.has(nextToken)) throw new Error("Repeated avatar listing cursor");
            if (nextToken) seen.add(nextToken);
            if (seen.size >= 100) throw new Error("Avatar inventory exceeds safe bound");
            pageToken = nextToken;
          } while (pageToken);
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
            const [snapshot, deletion] = await Promise.all([tx.get(ref), tx.get(freeze)]);
            if (deletion.exists || snapshot.get("avatarCleanupToken") !== token || snapshot.get("avatarCleanupLocked") !== true || snapshot.get("avatarServerManaged") !== true) throw new Error("Avatar cleanup lease lost");
            // Recheck current aliases inside the retirement transaction, even if a trusted writer bypassed the lease.
            if (selectOrphanAvatars(uid, bucket.name, snapshot.data() ?? {}, [candidate], Date.now()).length !== 1) throw new Error("Avatar no longer eligible for retirement");
            // Durable marker, retained even if deletion fails.
            tx.set(ref.collection("retiredAvatars").doc(candidate.name.split("/").pop()!), { generation: candidate.generation, retiredAt: new Date().toISOString() });
          });
        },
        async deleteGeneration(candidate) {
          await verify();
          const [live, marker] = await Promise.all([ref.get(), ref.collection("retiredAvatars").doc(candidate.name.split("/").pop()!).get()]);
          if (live.get("avatarCleanupToken") !== token || live.get("avatarCleanupLocked") !== true || live.get("avatarServerManaged") !== true || marker.get("generation") !== candidate.generation || selectOrphanAvatars(uid, bucket.name, live.data() ?? {}, [candidate], Date.now()).length !== 1) throw new Error("Avatar deletion precondition lost");
          if (!Number.isSafeInteger(Number(candidate.generation)) || Number(candidate.generation) <= 0) throw new Error("Missing object generation");
          await bucket.file(candidate.name).delete({ ifGenerationMatch: Number(candidate.generation), ignoreNotFound: true });
        },
        async release() {
          await db.runTransaction(async tx => {
            const snapshot = await tx.get(ref);
            if (snapshot.get("avatarCleanupToken") === token) tx.update(ref, { avatarCleanupLocked: false, avatarCleanupToken: null, avatarCleanupStartedAt: null });
          });
        },
      };
    },
  };
}
