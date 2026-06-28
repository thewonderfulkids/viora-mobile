import { HttpsError } from "firebase-functions/https";

import { getOpenAIClient } from "./client";
import {
  buildWellnessSystemPrompt,
  buildWellnessUserPrompt,
} from "./promptBuilder";
import { WellnessAIInput, WellnessAIResponse } from "./types";

function validateInput(data: unknown): WellnessAIInput {
  const input = data as WellnessAIInput;

  if (!input?.question || typeof input.question !== "string") {
    throw new HttpsError("invalid-argument", "Question is required.");
  }

  if (!input.dashboard?.todayStats) {
    throw new HttpsError("invalid-argument", "Dashboard context is required.");
  }

  return input;
}

export async function generateWellnessAdviceHandler(
  data: unknown
): Promise<WellnessAIResponse> {
  const input = validateInput(data);

  const client = getOpenAIClient();

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: buildWellnessSystemPrompt(),
      },
      {
        role: "user",
        content: buildWellnessUserPrompt(input),
      },
    ],
  });

  return {
    answer:
      response.output_text ||
      "I could not generate guidance right now. Please try again.",
  };
}