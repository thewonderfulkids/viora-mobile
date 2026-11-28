import OpenAI from "openai";

import { getRequiredEnv } from "../config/env";

export function getOpenAIClient() {
  return new OpenAI({
    apiKey: getRequiredEnv("OPENAI_API_KEY"),
    // One reserved quota slot must not silently trigger multiple provider attempts.
    maxRetries: 0,
    timeout: 20000,
  });
}