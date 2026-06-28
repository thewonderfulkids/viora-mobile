import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";

import { generateWellnessAdviceHandler } from "./ai";

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