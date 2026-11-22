import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

    try {
      await getAuth().verifyIdToken(match[1], true);
    } catch {
      res.status(401).json({ error: "Invalid or expired authentication" });
      return;
    }

    if (!req.body || typeof req.body.question !== "string" || req.body.question.trim().length === 0 || req.body.question.length > 2000 || !req.body.dashboard?.todayStats) {
      res.status(400).json({ error: "Invalid wellness request" });
      return;
    }

    try {
      const result = await generateWellnessAdviceHandler(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({
        error: error.message || "Unable to generate AI response",
      });
    }
  }
);

export { bootstrapFirstAdmin } from "./admin/bootstrapFirstAdmin";
export { createDefaultAdmin } from "./admin/createDefaultAdmin";

export { adminGrantPremiumByEmail, claimPendingPremiumGrant } from "./admin/premiumAccessGrants";

export { requestAccountDeletion } from "./accountDeletion/requestAccountDeletion";

export { previewAccountDeletion } from "./accountDeletion/previewAccountDeletion";
