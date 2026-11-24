import { useCallback, useEffect, useRef, useState } from "react";

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
} from "../types";

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
  const didLoadInitialHistory = useRef(false);

  const pendingSend = useRef(false);
  const failedAttempt = useRef<{ uid: string; conversationId: string; question: string; questionSaved: boolean } | null>(null);
  const [retryAvailable, setRetryAvailable] = useState(false);

  const [loading, setLoading] = useState(false);
  const [contextLoading, setContextLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AICoachMessage[]>([]);
  const [threads, setThreads] = useState<AIConversationThread[]>([]);
  const [activeConversationId, setActiveConversationId] = useState(createConversationId);
  const [contextSnapshot, setContextSnapshot] = useState<AICoachContextSnapshot | null>(null);
  const [quickActions, setQuickActions] = useState<AICoachQuickAction[]>([]);
  const [followUps, setFollowUps] = useState<AICoachFollowUpSuggestion[]>([]);

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

        if (auth.currentUser?.uid !== currentUser.uid) return;
        setContextSnapshot(context.contextSnapshot);
        setQuickActions(context.quickActions);
        setFollowUps(context.followUps);
      } finally {
        if (auth.currentUser?.uid === currentUser.uid) setContextLoading(false);
      }
    },
    [activeConversationId, data]
  );

  const loadThreads = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const conversationThreads = await getAICoachThreads({ uid: currentUser.uid });
    if (auth.currentUser?.uid === currentUser.uid) setThreads(conversationThreads);
  }, []);

  const loadLatestHistory = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setHistoryLoading(false);
      return;
    }

    failedAttempt.current = null;
    setRetryAvailable(false);
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const latestHistory = await getAICoachLatestHistory({ uid: currentUser.uid });
      if (auth.currentUser?.uid !== currentUser.uid) return;
      const mappedMessages = mapMessages(latestHistory.messages);
      const nextConversationId =
        latestHistory.messages.length > 0
          ? latestHistory.messages[0].conversationId
          : createConversationId();

      setMessages(mappedMessages);
      setThreads(latestHistory.threads);
      setActiveConversationId(nextConversationId);
    } catch (error: any) {
      if (auth.currentUser?.uid === currentUser.uid) setHistoryError(error?.message || "Unable to load AI conversation history.");
    } finally {
      if (auth.currentUser?.uid === currentUser.uid) setHistoryLoading(false);
    }
  }, []);

  const openConversation = useCallback(
    async (conversationId: string) => {
      const currentUser = auth.currentUser;
      if (!currentUser || !conversationId || pendingSend.current) return;
      failedAttempt.current = null;
      setRetryAvailable(false);

      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const conversationMessages = await getAICoachConversation({
          uid: currentUser.uid,
          conversationId,
        });

        if (auth.currentUser?.uid !== currentUser.uid) return;
        setActiveConversationId(conversationId);
        setMessages(mapMessages(conversationMessages));
        await refreshCoachContext(conversationId);
      } catch (error: any) {
        if (auth.currentUser?.uid === currentUser.uid) setHistoryError(error?.message || "Unable to open this conversation.");
      } finally {
        if (auth.currentUser?.uid === currentUser.uid) setHistoryLoading(false);
      }
    },
    [refreshCoachContext]
  );

  const startNewConversation = useCallback(() => {
    if (pendingSend.current) return;
    failedAttempt.current = null;
    setRetryAvailable(false);
    const conversationId = createConversationId();

    setActiveConversationId(conversationId);
    setMessages([]);
    setHistoryError(null);
    setFollowUps([]);

    void refreshCoachContext(conversationId);
  }, [refreshCoachContext]);

  useEffect(() => {
    if (didLoadInitialHistory.current) return;

    didLoadInitialHistory.current = true;
    void loadLatestHistory();
  }, [loadLatestHistory]);

  useEffect(() => {
    if (data) {
      void refreshCoachContext(activeConversationId);
    }
  }, [activeConversationId, data, refreshCoachContext]);

  async function askWellnessCoach(userQuestion?: string, options?: { retry?: boolean }) {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Please login again");
    if (!data) throw new Error("Dashboard not loaded");
    if (pendingSend.current) return;

    const retry = options?.retry === true;
    const attempt = retry
      ? failedAttempt.current
      : { uid: currentUser.uid, conversationId: activeConversationId, question: userQuestion?.trim() ?? "", questionSaved: false };
    if (retry && (!attempt || attempt.uid !== currentUser.uid || attempt.conversationId !== activeConversationId)) return;
    if (!attempt?.question) throw new Error("Please enter a wellness question.");

    pendingSend.current = true;
    failedAttempt.current = null;
    setRetryAvailable(false);
    if (!retry) {
      const userMessage = createLocalMessage("user", attempt.question);
      setMessages((prev) => [...prev, userMessage]);
    }
    setLoading(true);

    try {
      const result = await askContextAwareWellnessCoach({
        uid: attempt.uid,
        question: attempt.question,
        conversationId: attempt.conversationId,
        dashboard: data,
        questionSaved: attempt.questionSaved,
        onQuestionSaved: () => { attempt.questionSaved = true; },
      });

      if (auth.currentUser?.uid !== attempt.uid) return;
      const assistantMessage = createLocalMessage("assistant", result.reply);
      setMessages((prev) => [...prev, assistantMessage]);
      setContextSnapshot(result.contextSnapshot);
      setQuickActions(result.quickActions);
      setFollowUps(result.followUps);

      // A failed refresh must not turn an answered question into a retry.
      void loadThreads().catch(() => undefined);
      return result.reply;
    } catch (error) {
      if (auth.currentUser?.uid === attempt.uid) {
        failedAttempt.current = attempt;
        setRetryAvailable(true);
      }
      throw error;
    } finally {
      pendingSend.current = false;
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
    retryAvailable,
  };
}
