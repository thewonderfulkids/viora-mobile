import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { Candidate, DeletionAdapter, DeletionCheckpoint } from "./deletionExecutionCore";

// Deliberately not exported from the Functions entrypoint. Synthetic fixture
// namespace only; no production inventory or retention assumptions.
export function createEmulatorDeletionAdapter(uid: string): DeletionAdapter {
  const loopback = (value: string | undefined) => !!value && /^(localhost|127\.0\.0\.1):[0-9]+$/.test(value);
  if (!loopback(process.env.FIRESTORE_EMULATOR_HOST) ||
      !loopback(process.env.FIREBASE_AUTH_EMULATOR_HOST) ||
      !loopback(process.env.FIREBASE_STORAGE_EMULATOR_HOST) ||
      process.env.GCLOUD_PROJECT !== "demo-viora-deletion" ||
      !/^fixture-[a-zA-Z0-9-]+$/.test(uid)) throw Error("Emulator fixture required");
  const db = getFirestore();
  if (db.app.options.projectId !== "demo-viora-deletion") throw Error("Wrong Firebase project");
  const auth = getAuth(db.app);
  const bucket = getStorage(db.app).bucket("demo-viora-deletion.appspot.com");
  const lock = db.doc("deletionFixtures/" + uid);
  const records = lock.collection("records");
  const prefix = "deletion-fixtures/" + uid + "/";
  let leased = false;
  const guard = (target: string) => { if (target !== uid || !leased) throw Error("Fixture lease required"); };
  async function user() {
    try { return await auth.getUser(uid); }
    catch (e) { if ((e as {code?: string}).code === "auth/user-not-found") return null; throw e; }
  }
  return {
    async withExclusiveLease(target, run) {
      if (target !== uid || leased) throw Error("Invalid lease");
      await db.runTransaction(async tx => {
        const doc = await tx.get(lock);
        if (!doc.exists || doc.get("frozen") !== true || doc.get("leased") === true) throw Error("Fixture unavailable");
        tx.update(lock, { leased: true });
      });
      leased = true;
      try { return await run(); }
      finally { leased = false; await lock.update({ leased: false }); }
    },
    async assertAuthorizedAndFrozen(target, phase) {
      guard(target);
      const doc = await lock.get();
      const account = await user();
      if (doc.get("frozen") !== true || doc.get("leased") !== true ||
          (account && (!account.disabled || account.metadata.creationTime !== doc.get("creationTime"))) ||
          (!account && phase === "cleanup")) throw Error("Fixture authorization failed");
    },
    async readCheckpoint(target) {
      guard(target);
      return ((await lock.get()).get("state") ?? null) as DeletionCheckpoint | null;
    },
    async inventory(target) {
      guard(target);
      const docs = await records.get();
      const candidates: Candidate[] = docs.docs.map(doc => ({
        path: doc.ref.path, ownerIds: Array.isArray(doc.get("ownerIds")) ? doc.get("ownerIds") : [],
        shared: doc.get("shared") === true, retained: doc.get("retained") === true
      }));
      return { complete: true, candidates, unresolved: [] };
    },
    async eraseOwnedRecord(target, candidate) {
      guard(target);
      if (!candidate.path.startsWith(records.path + "/") || candidate.path.slice(records.path.length + 1).includes("/")) throw Error("Invalid fixture path");
      await db.runTransaction(async tx => {
        const ref = db.doc(candidate.path);
        const doc = await tx.get(ref);
        if (!doc.exists) return;
        const owners = doc.get("ownerIds");
        if (!Array.isArray(owners) || !owners.length || owners.some(x => x !== uid) || doc.get("shared") || doc.get("retained")) throw Error("Ownership changed");
        tx.delete(ref);
      });
    },
    async eraseOwnedStorage(target) {
      guard(target);
      const [files] = await bucket.getFiles({ prefix });
      for (const file of files) await file.delete({ ignoreNotFound: true });
    },
    async verifyStorageEmpty(target) {
      guard(target);
      const [files] = await bucket.getFiles({ prefix, maxResults: 1 });
      return files.length === 0;
    },
    async checkpoint(target, state) { guard(target); await lock.update({ state }); },
    async eraseAuthIfPresent(target) {
      guard(target);
      const account = await user();
      if (!account) return;
      const doc = await lock.get();
      if (!account.disabled || account.metadata.creationTime !== doc.get("creationTime") || doc.get("state") !== "auth_pending") throw Error("Auth generation changed");
      await auth.deleteUser(uid);
    }
  };
}
