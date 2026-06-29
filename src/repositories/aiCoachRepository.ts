import {
  getAIConversationMessagesByConversationId,
  getAIConversationThreads,
  getLatestAIConversationMessages,
  saveConversation,
} from "../services/ai/conversationService";
import { DashboardData } from "../services/dashboardService";
import { AICoachHistoryState } from "../types";

export async function saveAICoachMessage({
  uid,
  role,
  message,
  conversationId,
  dashboard,
  model,
}: {
  uid: string;
  role: "user" | "assistant" | "system";
  message: string;
  conversationId: string;
  dashboard?: DashboardData | null;
  model?: string;
}) {
  await saveConversation({
    uid,
    role,
    message,
    conversationId,
    mode: "wellness",
    dashboard: dashboard ?? null,
    model,
  });
}

export async function getAICoachLatestHistory({
  uid,
}: {
  uid: string;
}): Promise<AICoachHistoryState> {
  const [messages, threads] = await Promise.all([
    getLatestAIConversationMessages({ uid, maxResults: 20 }),
    getAIConversationThreads({ uid }),
  ]);

  return { messages, threads };
}

export async function getAICoachConversation({
  uid,
  conversationId,
}: {
  uid: string;
  conversationId: string;
}) {
  return getAIConversationMessagesByConversationId({ uid, conversationId });
}

export async function getAICoachThreads({ uid }: { uid: string }) {
  return getAIConversationThreads({ uid });
}
