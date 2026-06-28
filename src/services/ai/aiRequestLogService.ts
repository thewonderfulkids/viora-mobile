import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { AI_REQUEST_LOGS_COLLECTION } from "../../firebase/firestoreCollections";
import { AIErrorCode } from "./aiErrors";

type AIRequestLogStatus = "success" | "failed";

type SaveAIRequestLogInput = {
  requestId: string;
  operation: string;
  status: AIRequestLogStatus;
  durationMs: number;
  errorCode?: AIErrorCode | null;
  errorMessage?: string | null;
};

export async function saveAIRequestLog({
  requestId,
  operation,
  status,
  durationMs,
  errorCode = null,
  errorMessage = null,
}: SaveAIRequestLogInput): Promise<void> {
  try {
    await addDoc(collection(db, AI_REQUEST_LOGS_COLLECTION), {
      requestId,
      operation,
      status,
      durationMs,
      errorCode,
      errorMessage,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn("AI request log skipped:", error);
  }
}