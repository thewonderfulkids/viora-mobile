export type AIErrorCode =
  | "NETWORK"
  | "TIMEOUT"
  | "RATE_LIMIT"
  | "AUTH"
  | "PROVIDER"
  | "VALIDATION"
  | "UNKNOWN";

export class AIError extends Error {
  code: AIErrorCode;
  requestId?: string;
  status?: number;

  constructor({
    code,
    message,
    requestId,
    status,
  }: {
    code: AIErrorCode;
    message: string;
    requestId?: string;
    status?: number;
  }) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.requestId = requestId;
    this.status = status;
  }
}

export function normalizeAIError(error: unknown, requestId?: string): AIError {
  if (error instanceof AIError) {
    if (requestId && !error.requestId) error.requestId = requestId;
    return error;
  }

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
