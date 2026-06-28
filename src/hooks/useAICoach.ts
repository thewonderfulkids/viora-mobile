import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "./useDashboard";

import { auth } from "../firebase/firebaseConfig";
import { ActivityLogger } from "../services/activity";
import {
  AIConversationThread,
  buildAIContext,
  buildAIMemoryContext,
  buildWellnessIntelligence,
  buildWellnessPrompt,
  getAIConversationMessagesByConversationId,
  getAIConversationThreads,
  getLatestAIConversationMessages,
  processConversationMemory,
  processConversationSummary,
  saveConversation,
} from "../services/ai";
import { generateWellnessAdvice } from "../services/ai/remoteAIService";

export type AICoachMessage = {
  id: string;
  role: "user" | "assistant";
  message: string;
};

function createConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function createLocalMessage(
  role: AICoachMessage["role"],
  message: string
): AICoachMessage {
  return {
    id: `${role}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    role,
    message,
  };
}

function mapMessages(items: any[]): AICoachMessage[] {
  return items
    .filter((item) => item.role === "user" || item.role === "assistant")
    .map((item) => ({
      id: item.id,
      role: item.role as "user" | "assistant",
      message: item.message,
    }));
}

export function useAICoach() {
  const { data } = useDashboard();

  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [threads, setThreads] = useState<AIConversationThread[]>([]);
  const [activeConversationId, setActiveConversationId] =
    useState(createConversationId);

  const loadThreads = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const conversationThreads = await getAIConversationThreads({
      uid: currentUser.uid,
    });

    setThreads(conversationThreads);
  }, []);

  const loadLatestHistory = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const latestMessages = await getLatestAIConversationMessages({
        uid: currentUser.uid,
        maxResults: 20,
      });

      setMessages(mapMessages(latestMessages));

      if (latestMessages.length > 0) {
        setActiveConversationId(latestMessages[0].conversationId);
      }

      await loadThreads();
    } catch (error: any) {
      setHistoryError(
        error?.message || "Unable to load AI conversation history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [loadThreads]);

  const openConversation = useCallback(async (conversationId: string) => {
    const currentUser = auth.currentUser;

    if (!currentUser || !conversationId) return;

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const conversationMessages =
        await getAIConversationMessagesByConversationId({
          uid: currentUser.uid,
          conversationId,
        });

      setActiveConversationId(conversationId);
      setMessages(mapMessages(conversationMessages));
    } catch (error: any) {
      setHistoryError(error?.message || "Unable to open this conversation.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(createConversationId());
    setMessages([]);
    setHistoryError(null);
  }, []);

  useEffect(() => {
    loadLatestHistory();
  }, [loadLatestHistory]);

  async function askWellnessCoach(userQuestion?: string) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Please login again");
    }

    if (!data) {
      throw new Error("Dashboard not loaded");
    }

    const question = userQuestion?.trim();

    if (!question) {
      throw new Error("Please enter a wellness question.");
    }

    const userMessage = createLocalMessage("user", question);

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const memoryContext = await buildAIMemoryContext({
        userId: currentUser.uid,
        maxMemories: 8,
        maxSummaries: 3,
      });

      const intelligence = buildWellnessIntelligence({
        dashboard: data,
        profile: memoryContext.profile,
        memories: memoryContext.memories,
        summaries: memoryContext.recentSummaries,
      });

      const intelligenceContext = buildAIContext({
        memoryContext,
        intelligence,
      });

      const prompt = buildWellnessPrompt(data, {
        memoryContext,
      });

      const aiQuestion = `${prompt}

Current user question:
${question}`;

      await saveConversation({
        uid: currentUser.uid,
        role: "user",
        message: question,
        conversationId: activeConversationId,
        mode: "wellness",
        dashboard: data,
      });

      const reply = await generateWellnessAdvice({
        question: aiQuestion,
        dashboard: data,
      });

      const assistantMessage = createLocalMessage("assistant", reply);

      setMessages((prev) => [...prev, assistantMessage]);

      await saveConversation({
        uid: currentUser.uid,
        role: "assistant",
        message: reply,
        conversationId: activeConversationId,
        mode: "wellness",
        dashboard: data,
        model: "gpt-5.5",
      });

      await ActivityLogger.aiChat({
        userId: currentUser.uid,
        question,
        conversationId: activeConversationId,
        model: "gpt-5.5",
      });

      processConversationMemory({
        userId: currentUser.uid,
        userMessage: question,
        assistantMessage: reply,
      });

      processConversationSummary({
        userId: currentUser.uid,
        conversationId: activeConversationId,
      });

      await loadThreads();

      return reply;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    historyLoading,
    historyError,
    messages,
    threads,
    activeConversationId,
    reloadHistory: loadLatestHistory,
    openConversation,
    startNewConversation,
    askWellnessCoach,
  };
}