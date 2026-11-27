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

  // Select a model enabled for the deployed OpenAI project. The previous
  // hardcoded gpt-4.1-mini produced 403 for projects without model access.
  // OPENAI_MODEL can override the default without another code release.
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const response = await client.responses.create({
    model,
    // Viora manages its own chat history; this request does not use stored responses.
    store: false,
    // Bound billable output, including reasoning tokens where applicable.
    max_output_tokens: 1200,
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