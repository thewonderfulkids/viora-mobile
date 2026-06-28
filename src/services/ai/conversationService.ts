import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../../firebase/firebaseConfig";
import { COLLECTIONS } from "../../firebase/firestoreCollections";
import { AIConversationContext, AIMode } from "../../firebase/firestoreTypes";
import { DashboardData } from "../dashboardService";

export type AIConversationMessage = {
  id: string;
  uid: string;
  conversationId: string;
  mode: AIMode;
  role: "user" | "assistant" | "system";
  message: string;
  summary: string;
  createdAt: Date | null;
};

export type AIConversationThread = {
  conversationId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  updatedAt: Date | null;
};

function buildConversationContext(
  dashboard?: DashboardData | null
): AIConversationContext {
  return {
    waterMl: dashboard?.todayStats.waterMl ?? 0,
    sleepMinutes: dashboard?.todayStats.sleepMinutes ?? 0,
    yogaMinutes: dashboard?.todayStats.yogaMinutes ?? 0,
    musicMinutes: dashboard?.todayStats.musicMinutes ?? 0,
    wellnessScore: dashboard?.wellnessScore ?? 0,
    stressLevel: dashboard?.user?.stressLevel ?? "Moderate",
    goal: dashboard?.user?.goal ?? "Healthy Lifestyle",
  };
}

function buildSummary(message: string) {
  return message.replace(/\s+/g, " ").trim().slice(0, 140);
}

function toConversationMessage(id: string, data: any): AIConversationMessage {
  const createdAt =
    data.createdAt && typeof data.createdAt.toDate === "function"
      ? data.createdAt.toDate()
      : null;

  return {
    id,
    uid: String(data.uid || ""),
    conversationId: String(data.conversationId || ""),
    mode: data.mode || "wellness",
    role: data.role || "assistant",
    message: String(data.message || ""),
    summary: String(data.summary || ""),
    createdAt,
  };
}

function sortByCreatedAtAsc(
  a: AIConversationMessage,
  b: AIConversationMessage
) {
  return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
}

function sortThreadsDesc(a: AIConversationThread, b: AIConversationThread) {
  return (b.updatedAt?.getTime() ?? 0) - (a.updatedAt?.getTime() ?? 0);
}

export async function saveConversation({
  uid,
  role,
  message,
  conversationId,
  mode = "wellness",
  dashboard = null,
  tokens,
  model,
}: {
  uid: string;
  role: "user" | "assistant" | "system";
  message: string;
  conversationId: string;
  mode?: AIMode;
  dashboard?: DashboardData | null;
  tokens?: number;
  model?: string;
}) {
  await addDoc(collection(db, COLLECTIONS.aiConversations), {
    uid,
    conversationId,
    mode,
    role,
    message,
    summary: buildSummary(message),
    context: buildConversationContext(dashboard),
    tokens: tokens ?? null,
    model: model ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isDeleted: false,
  });
}

export async function getLatestAIConversationMessages({
  uid,
  maxResults = 20,
}: {
  uid: string;
  maxResults?: number;
}): Promise<AIConversationMessage[]> {
  if (!uid) return [];

  const safeLimit = Math.min(Math.max(maxResults, 1), 50);

  const q = query(
    collection(db, COLLECTIONS.aiConversations),
    where("uid", "==", uid),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => toConversationMessage(item.id, item.data()))
    .reverse();
}

export async function getAIConversationMessagesByConversationId({
  uid,
  conversationId,
}: {
  uid: string;
  conversationId: string;
}): Promise<AIConversationMessage[]> {
  if (!uid || !conversationId) return [];

  const q = query(
    collection(db, COLLECTIONS.aiConversations),
    where("uid", "==", uid),
    where("conversationId", "==", conversationId),
    where("isDeleted", "==", false)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => toConversationMessage(item.id, item.data()))
    .sort(sortByCreatedAtAsc);
}

export async function getAIConversationThreads({
  uid,
  maxMessagesToScan = 100,
}: {
  uid: string;
  maxMessagesToScan?: number;
}): Promise<AIConversationThread[]> {
  if (!uid) return [];

  const safeLimit = Math.min(Math.max(maxMessagesToScan, 20), 200);

  const q = query(
    collection(db, COLLECTIONS.aiConversations),
    where("uid", "==", uid),
    where("isDeleted", "==", false),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );

  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map((item) =>
    toConversationMessage(item.id, item.data())
  );

  const threadMap = new Map<string, AIConversationMessage[]>();

  for (const message of messages) {
    if (!message.conversationId) continue;

    const existing = threadMap.get(message.conversationId) ?? [];
    existing.push(message);
    threadMap.set(message.conversationId, existing);
  }

  const threads: AIConversationThread[] = Array.from(threadMap.entries()).map(
    ([conversationId, items]) => {
      const sorted = [...items].sort(sortByCreatedAtAsc);
      const firstUserMessage =
        sorted.find((item) => item.role === "user") ?? sorted[0];
      const lastMessage = sorted[sorted.length - 1];

      return {
        conversationId,
        title: firstUserMessage?.summary || "Wellness chat",
        lastMessage: lastMessage?.summary || "",
        messageCount: sorted.length,
        updatedAt: lastMessage?.createdAt ?? null,
      };
    }
  );

  return threads.sort(sortThreadsDesc);
}