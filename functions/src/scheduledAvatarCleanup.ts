import { FieldPath, getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { runAvatarCleanup } from "./avatarCleanupWorker";
import { firebaseAvatarCleanupStore } from "./firebaseAvatarCleanupStore";

// Explicit rollout gate; only already migrated profiles are eligible.
export const scheduledAvatarCleanup = onSchedule({ schedule: "every day 03:00", timeZone: "Asia/Kolkata", region: "asia-south1", timeoutSeconds: 540, maxInstances: 1 }, async () => {
  if (process.env.VIORA_ENABLE_AVATAR_CLEANUP !== "true") return;
  const db = getFirestore();
  const state = db.collection("maintenanceState").doc("avatarCleanup");
  const cursor = (await state.get()).get("cursor");
  const query = db.collection("users").where("avatarServerManaged", "==", true).orderBy(FieldPath.documentId()).limit(10);
  const page = await (typeof cursor === "string" && cursor ? query.startAfter(cursor) : query).get();
  const store = firebaseAvatarCleanupStore();
  for (const user of page.docs) {
    try { await runAvatarCleanup(store, user.id); }
    catch { console.error("Avatar cleanup failed; manual lease review may be required"); }
    await state.set({ cursor: user.id }, { merge: true });
  }
  if (page.size < 10) await state.set({ cursor: null }, { merge: true });
});
