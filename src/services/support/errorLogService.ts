import { auth } from "../../firebase/firebaseConfig";
import { createClientErrorLog } from "../../repositories";
import { ClientErrorLogInput, ClientErrorLogRecord } from "../../types";
import { buildAppDiagnostics } from "../sync";

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function logClientError(input: ClientErrorLogInput): Promise<string | null> {
  try {
    const now = new Date().toISOString();
    const record: ClientErrorLogRecord = {
      id: createId("client_error"),
      userId: input.userId ?? auth.currentUser?.uid ?? null,
      source: input.source,
      message: input.message || "Unknown client error",
      stack: input.stack ?? null,
      componentStack: input.componentStack ?? null,
      route: input.route ?? null,
      diagnostics: buildAppDiagnostics({ isOnline: true, isCheckingNetwork: false, lastCheckedAt: Date.now() }),
      createdAt: now,
      updatedAt: now,
    };

    return createClientErrorLog(record);
  } catch (error) {
    console.warn("Unable to log client error", error);
    return null;
  }
}
