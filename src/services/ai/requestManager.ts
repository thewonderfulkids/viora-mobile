import { AIError, normalizeAIError } from "./aiErrors";
import { saveAIRequestLog } from "./aiRequestLogService";

type AIRequestManagerOptions<T> = {
  operation: string;
  timeoutMs?: number;
  maxRetries?: number;
  execute: (requestId: string) => Promise<T>;
};

type ManagedAIRequestResult<T> = {
  requestId: string;
  durationMs: number;
  data: T;
};

function createRequestId() {
  return `ai_req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  requestId: string
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(
        new AIError({
          code: "TIMEOUT",
          message: "AI request timed out.",
          requestId,
        })
      );
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeout!);
  }
}

export async function runManagedAIRequest<T>({
  operation,
  timeoutMs = 30000,
  maxRetries = 1,
  execute,
}: AIRequestManagerOptions<T>): Promise<ManagedAIRequestResult<T>> {
  const requestId = createRequestId();
  const startedAt = Date.now();

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const data = await withTimeout(execute(requestId), timeoutMs, requestId);
      const durationMs = Date.now() - startedAt;

      await saveAIRequestLog({
        requestId,
        operation,
        status: "success",
        durationMs,
      });

      return {
        requestId,
        durationMs,
        data,
      };
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        await delay(800 * (attempt + 1));
      }
    }
  }

  const durationMs = Date.now() - startedAt;
  const normalized = normalizeAIError(lastError, requestId);

  await saveAIRequestLog({
    requestId,
    operation,
    status: "failed",
    durationMs,
    errorCode: normalized.code,
    errorMessage: normalized.message,
  });

  console.warn("Managed AI request failed:", {
    operation,
    requestId,
    code: normalized.code,
    message: normalized.message,
  });

  throw normalized;
}