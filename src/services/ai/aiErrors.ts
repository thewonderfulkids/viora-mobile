export type AIErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "PROVIDER"
  | "VALIDATION"
  | "UNKNOWN";

export class AIError extends Error {
  code: AIErrorCode;
  requestId?: string;

  constructor({
    code,
    message,
    requestId,
  }: {
    code: AIErrorCode;
    message: string;
    requestId?: string;
  }) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.requestId = requestId;
  }
}

export function normalizeAIError(error: unknown, requestId?: string): AIError {
  if (error instanceof AIError) return error;

  const message =
    error instanceof Error
      ? error.message
      : "Unable to connect with Viora AI. Please try again.";

  if (message.toLowerCase().includes("timeout")) {
    return new AIError({
      code: "TIMEOUT",
      message: "Viora AI is taking longer than expected. Please try again.",
      requestId,
    });
  }

  if (message.toLowerCase().includes("rate")) {
    return new AIError({
      code: "RATE_LIMIT",
      message: "Viora AI is receiving many requests. Please try again shortly.",
      requestId,
    });
  }

  if (message.toLowerCase().includes("network")) {
    return new AIError({
      code: "NETWORK",
      message: "Network issue detected. Please check your connection.",
      requestId,
    });
  }

  return new AIError({
    code: "UNKNOWN",
    message,
    requestId,
  });
}