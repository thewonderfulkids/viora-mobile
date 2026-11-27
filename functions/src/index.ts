import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getAppCheck } from "firebase-admin/app-check";
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

    // Enforcement is opt-in until supported mobile clients can supply App Check tokens.
    if (process.env.VIORA_ENFORCE_APP_CHECK === "true") {
      const appCheckToken = req.get("X-Firebase-AppCheck");
      if (!appCheckToken) {
        res.status(401).json({ error: "App verification required" });
        return;
      }
      try {
        await getAppCheck().verifyToken(appCheckToken);
      } catch {
        res.status(401).json({ error: "App verification failed" });
        return;
      }
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

    // Validate only fields consumed by the provider; tolerate legacy dashboard extras.
    const dashboard = body.dashboard;
    const stats = dashboard.todayStats;
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      value !== null && typeof value === "object" && !Array.isArray(value);
    const boundedNumber = (value: unknown, max: number) =>
      typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= max;
    const profile = dashboard.user;
    if (!isRecord(body) || !isRecord(dashboard) || !isRecord(stats) ||
        !boundedNumber(stats.waterMl, 100000) ||
        !boundedNumber(stats.sleepMinutes, 1440) ||
        !boundedNumber(stats.yogaMinutes, 1440) ||
        !boundedNumber(stats.musicMinutes, 1440) ||
        !boundedNumber(dashboard.wellnessScore, 100) ||
        (profile != null && (!isRecord(profile) ||
          ["goal", "stressLevel", "lifestyle"].some(key =>
            profile[key] != null && (typeof profile[key] !== "string" || (profile[key] as string).length > 256))))) {
      res.status(400).json({ error: "Invalid wellness request" });
      return;
    }

    try {
      const db = getFirestore();
      const quota = db.collection("aiRateLimits").doc(uid);
      const globalQuota = db.collection("aiGlobalBudget").doc("daily");
      const globalLimit = Number(process.env.VIORA_AI_GLOBAL_DAILY_LIMIT ?? "1000");
      if (!Number.isSafeInteger(globalLimit) || globalLimit < 1) throw new Error("Invalid AI budget configuration");
      const allowed = await db.runTransaction(async tx => {
        const freeze = await tx.get(db.collection("accountDeletionLocks").doc(uid));
        if (freeze.exists) return false;
        const old = (await tx.get(quota)).data();
        const global = (await tx.get(globalQuota)).data();
        // Recompute on every transaction attempt, using one clock sample.
        const now = Date.now();
        const minute = Math.floor(now / 60000);
        const day = Math.floor(now / 86400000);
        const minuteCount = old?.minute === minute ? old.minuteCount : 0;
        const dayCount = old?.day === day ? old.dayCount : 0;
        // Fail closed for corrupt active-window counters rather than granting extra quota.
        if (!Number.isSafeInteger(minuteCount) || minuteCount < 0 ||
            !Number.isSafeInteger(dayCount) || dayCount < 0 ||
            minuteCount >= 5 || dayCount >= 100) return false;
        const globalCount = global?.day === day ? global.count : 0;
        if (!Number.isSafeInteger(globalCount) || globalCount < 0 || globalCount >= globalLimit) return false;
        tx.set(globalQuota, { day, count: globalCount + 1, updatedAt: FieldValue.serverTimestamp() });
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
      // Never log provider error objects: they may contain request bodies, credentials or health data.
      console.error("Wellness AI provider request failed");
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

// H06: authenticated publication for explicitly migrated profiles only.
export { publishProfileAvatar } from "./publishProfileAvatar";
