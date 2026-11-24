import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";

import { generateWellnessAdviceHandler } from "./ai";

initializeApp();

setGlobalOptions({
  region: "asia-south1",
  maxInstances: 10,
});

export const generateWellnessAdviceHttp = onRequest(
  {
    cors: true,
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const authorization = req.headers.authorization || "";
    const match = /^Bearer (\S+)$/i.exec(authorization);
    if (!match) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    let uid: string;
    try {
      uid = (await getAuth().verifyIdToken(match[1], true)).uid;
    } catch {
      res.status(401).json({ error: "Invalid or expired authentication" });
      return;
    }

    const body = req.body;
    const hasCoachContext = body?.coachContext !== undefined;
    // Older APKs place the generated Coach context and question in one field.
    const questionLimit = hasCoachContext ? 2000 : 8000;
    if (
      !body || typeof body.question !== "string" || !body.question.trim() ||
      body.question.length > questionLimit || !body.dashboard?.todayStats ||
      (hasCoachContext && (typeof body.coachContext !== "string" || body.coachContext.length > 3500))
    ) {
      res.status(400).json({ error: "Invalid wellness request" });
      return;
    }

    try {
      const db = getFirestore();
      const quota = db.collection("aiRateLimits").doc(uid);
      const minute = Math.floor(Date.now() / 60000);
      const day = Math.floor(Date.now() / 86400000);
      const allowed = await db.runTransaction(async tx => {
        const old = (await tx.get(quota)).data();
        const minuteCount = old?.minute === minute ? Number(old.minuteCount) || 0 : 0;
        const dayCount = old?.day === day ? Number(old.dayCount) || 0 : 0;
        if (minuteCount >= 5 || dayCount >= 100) return false;
        tx.set(quota, { uid, minute, day, minuteCount: minuteCount + 1, dayCount: dayCount + 1, updatedAt: FieldValue.serverTimestamp() });
        return true;
      });
      if (!allowed) {
        res.status(429).json({ error: "AI Coach request limit reached. Please try again later." });
        return;
      }
      const result = await generateWellnessAdviceHandler(body);
      res.status(200).json(result);
    } catch (error: any) {
      // Do not expose OpenAI project identifiers, model entitlements,
      // provider diagnostics or other internal details to mobile clients.
      console.error("Wellness AI provider request failed", error);
      res.status(503).json({
        error: "AI Coach is temporarily unavailable. Please try again later.",
      });
    }
  }
);

export { bootstrapFirstAdmin } from "./admin/bootstrapFirstAdmin";
export { createDefaultAdmin } from "./admin/createDefaultAdmin";

export { adminGrantPremiumByEmail, claimPendingPremiumGrant } from "./admin/premiumAccessGrants";

export { requestAccountDeletion } from "./accountDeletion/requestAccountDeletion";

export { previewAccountDeletion } from "./accountDeletion/previewAccountDeletion";

export { prepareAccountDeletion, resetAccountDeletionPreflight } from "./accountDeletion/deletionPreflight";

export { discoverDeletionDataPaths } from "./accountDeletion/discoverDeletionDataPaths";
