import { auth } from "../../firebase/firebaseConfig";
import { AIError } from "./aiErrors";
import { AIProvider, AIProviderRequest, AIProviderResponse } from "./AIProvider";

type GenerateAIResponse = {
  answer?: string;
  model?: string;
};

const AI_FUNCTION_URL =
  "https://asia-south1-viora-9021a.cloudfunctions.net/generateWellnessAdviceHttp";

const AI_REQUEST_TIMEOUT_MS = 30000;
const COACH_CONTEXT_MAX_LENGTH = 3500;

function isValidAIResponse(
  data: GenerateAIResponse | null
): data is GenerateAIResponse & { answer: string } {
  return typeof data?.answer === "string" && data.answer.trim().length > 0;
}

function httpError(status: number) {
  if (status === 429) {
    return new AIError({ status, code: "RATE_LIMIT", message: "AI Coach request limit reached. Please try again later." });
  }
  if (status === 401) {
    return new AIError({ status, code: "AUTH", message: "Please sign in again to use Viora AI." });
  }
  if (status === 400 || status === 413 || status === 422) {
    return new AIError({ status, code: "VALIDATION", message: "AI Coach could not process that request. Try a shorter question." });
  }
  // Older servers may return provider diagnostics, including project identifiers.
  // Never forward those response bodies to the chat or request logs.
  return new AIError({ status, code: "PROVIDER", message: "AI Coach is temporarily unavailable. Please try again later." });
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
      if (!user) throw new AIError({ code: "AUTH", message: "Please sign in to use Viora AI." });
      if (request.expectedUid && request.expectedUid !== user.uid) {
        throw new AIError({ code: "AUTH", message: "Your sign-in changed. Please try again." });
      }
      let idToken: string;
      try {
        idToken = await user.getIdToken();
      } catch (error: unknown) {
        if ((error as { code?: string } | null)?.code === "auth/network-request-failed") {
          throw new AIError({ code: "NETWORK", message: "Network issue detected. Please check your connection." });
        }
        throw new AIError({ code: "AUTH", message: "Please sign in again to use Viora AI." });
      }
      if (auth.currentUser !== user) {
        throw new AIError({ code: "AUTH", message: "Your sign-in changed. Please try again." });
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

      if (!response.ok) throw httpError(response.status);

      let data: GenerateAIResponse | null = null;

      try {
        data = (await response.json()) as GenerateAIResponse;
      } catch {
        data = null;
      }

      if (!isValidAIResponse(data)) {
        throw new AIError({ code: "PROVIDER", message: "AI returned an empty response. Please try again." });
      }

      return {
        answer: data.answer.trim(),
        provider: this.name,
        model: typeof data.model === "string" ? data.model : "viora-cloud",
      };
    } catch (error: unknown) {
      if (error instanceof AIError) throw error;
      if (controller.signal.aborted || (error as { name?: string } | null)?.name === "AbortError") {
        throw new AIError({ code: "TIMEOUT", message: "AI is taking longer than expected. Please try again." });
      }
      throw new AIError({ code: "NETWORK", message: "Unable to connect with Viora AI. Check your connection and try again." });
    } finally {
      clearTimeout(timeout);
    }
  }
}
