import { auth } from "../../firebase/firebaseConfig";
import { AIProvider, AIProviderRequest, AIProviderResponse } from "./AIProvider";

type GenerateAIResponse = {
  answer?: string;
  error?: string;
  model?: string;
};

const AI_FUNCTION_URL =
  "https://asia-south1-viora-9021a.cloudfunctions.net/generateWellnessAdviceHttp";

const AI_REQUEST_TIMEOUT_MS = 30000;
const COACH_CONTEXT_MAX_LENGTH = 3500;

function isValidAIResponse(
  data: GenerateAIResponse
): data is GenerateAIResponse & { answer: string } {
  return typeof data.answer === "string" && data.answer.trim().length > 0;
}

export class VioraCloudAIProvider implements AIProvider {
  readonly name = "viora-cloud" as const;

  async generateWellnessAdvice(
    request: AIProviderRequest
  ): Promise<AIProviderResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Please sign in to use Viora AI.");
      if (request.expectedUid && request.expectedUid !== user.uid) {
        throw new Error("Your sign-in changed. Please try again.");
      }
      const idToken = await user.getIdToken();
      if (auth.currentUser !== user) {
        throw new Error("Your sign-in changed. Please try again.");
      }
      const response = await fetch(AI_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          question: request.question,
          coachContext: request.coachContext
            ?.slice(0, COACH_CONTEXT_MAX_LENGTH)
            .replace(/[\uD800-\uDBFF]$/, ""),
          dashboard: request.dashboard,
          mode: request.mode ?? "wellness",
          conversationId: request.conversationId ?? null,
        }),
        signal: controller.signal,
      });

      let data: GenerateAIResponse = {};

      try {
        data = (await response.json()) as GenerateAIResponse;
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate AI response right now.");
      }

      if (!isValidAIResponse(data)) {
        throw new Error("AI returned an empty response. Please try again.");
      }

      return {
        answer: data.answer.trim(),
        provider: this.name,
        model: (data as GenerateAIResponse).model ?? "viora-cloud",
      };
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new Error("AI is taking longer than expected. Please try again.");
      }

      throw new Error(
        error?.message || "Unable to connect with Viora AI. Please try again."
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}