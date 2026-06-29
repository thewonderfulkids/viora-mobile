import { useCallback, useEffect, useState } from "react";
import { useDashboard } from "./useDashboard";

import { auth } from "../firebase/firebaseConfig";
import {
  getAICoachConversation,
  getAICoachLatestHistory,
  getAICoachThreads,
} from "../repositories/aiCoachRepository";
import {
  askContextAwareWellnessCoach,
  getCurrentAICoachContext,
} from "../services/ai/contextAwareCoachService";
import { AIConversationThread } from "../services/ai";
import {
  AICoachContextSnapshot,
  AICoachFollowUpSuggestion,
  AICoachQuickAction,
} from "../types/aiCoach";

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
  const [contextLoading, setContextLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [threads, setThreads] = useState<AIConversationThread[]>([]);
  const [activeConversationId, setActiveConversationId] =
    useState(createConversationId);
  const [contextSnapshot, setContextSnapshot] =
    useState<AICoachContextSnapshot | null>(null);
  const [quickActions, setQuickActions] = useState<AICoachQuickAction[]>([]);
  const [followUps, setFollowUps] = useState<AICoachFollowUpSuggestion[]>([]);

  const loadThreads = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const conversationThreads = await getAICoachThreads({
      uid: currentUser.uid,
    });

    setThreads(conversationThreads);
  }, []);

  const refreshCoachContext = useCallback(
    async (conversationId = activeConversationId) => {
      const currentUser = auth.currentUser;
      if (!currentUser || !data) return;

      setContextLoading(true);

      try {
        const context = await getCurrentAICoachContext({
          uid: currentUser.uid,
          dashboard: data,
          conversationId,
        });

        setContextSnapshot(context.contextSnapshot);
        setQuickActions(context.quickActions);
        setFollowUps(context.followUps);
      } finally {
        setContextLoading(false);
      }
    },
    [activeConversationId, data]
  );

  const loadLatestHistory = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const latestHistory = await getAICoachLatestHistory({
        uid: currentUser.uid,
      });

      setMessages(mapMessages(latestHistory.messages));
      setThreads(latestHistory.threads);

      const nextConversationId =
        latestHistory.messages.length > 0
          ? latestHistory.messages[0].conversationId
          : activeConversationId;

      setActiveConversationId(nextConversationId);

      if (data) {
        await refreshCoachContext(nextConversationId);
      }
    } catch (error: any) {
      setHistoryError(
        error?.message || "Unable to load AI conversation history."
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [activeConversationId, data, refreshCoachContext]);

  const openConversation = useCallback(
    async (conversationId: string) => {
      const currentUser = auth.currentUser;

      if (!currentUser || !conversationId) return;

      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const conversationMessages = await getAICoachConversation({
          uid: currentUser.uid,
          conversationId,
        });

        setActiveConversationId(conversationId);
        setMessages(mapMessages(conversationMessages));
        await refreshCoachContext(conversationId);
      } catch (error: any) {
        setHistoryError(error?.message || "Unable to open this conversation.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [refreshCoachContext]
  );

  const startNewConversation = useCallback(() => {
    const conversationId = createConversationId();
    setActiveConversationId(conversationId);
    setMessages([]);
    setHistoryError(null);
    setFollowUps([]);

    refreshCoachContext(conversationId);
  }, [refreshCoachContext]);

  useEffect(() => {
    loadLatestHistory();
  }, [loadLatestHistory]);

  useEffect(() => {
    if (data) {
      refreshCoachContext(activeConversationId);
    }
  }, [activeConversationId, data, refreshCoachContext]);

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
      const result = await askContextAwareWellnessCoach({
        uid: currentUser.uid,
        question,
        conversationId: activeConversationId,
        dashboard: data,
      });

      const assistantMessage = createLocalMessage("assistant", result.reply);

      setMessages((prev) => [...prev, assistantMessage]);
      setContextSnapshot(result.contextSnapshot);
      setQuickActions(result.quickActions);
      setFollowUps(result.followUps);

      await loadThreads();

      return result.reply;
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    contextLoading,
    historyLoading,
    historyError,
    messages,
    threads,
    activeConversationId,
    contextSnapshot,
    quickActions,
    followUps,
    reloadHistory: loadLatestHistory,
    refreshCoachContext,
    openConversation,
    startNewConversation,
    askWellnessCoach,
  };
}
