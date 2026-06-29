import { router } from "expo-router";
import {
  Brain,
  Clock3,
  Home,
  MessageCircle,
  Plus,
  Sparkles,
} from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  AICoachFollowUpChips,
  AICoachQuickActionGrid,
  AIContextSnapshotCard,
  AIInputBar,
  AIMessageBubble,
  AISuggestionCard,
  AITypingIndicator,
} from "../components/ai";
import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { useAICoach } from "../hooks";
import { useToast } from "../hooks";
import { T } from "../i18n";
import { useAppTranslation } from "../i18n/useAppTranslation";
import { colors, radius, spacing } from "../theme";

function formatThreadDate(value: Date | null) {
  if (!value) return "Recently";

  return value.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

export default function AIScreen() {
  const {
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
    reloadHistory,
    openConversation,
    startNewConversation,
    askWellnessCoach,
  } = useAICoach();

  const toast = useToast();
  const { t } = useAppTranslation();

  const [input, setInput] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const suggestions = useMemo(
    () => [
      "Review today's wellness",
      "Improve my sleep",
      "Reduce stress",
      "Hydration advice",
    ],
    []
  );

  const handleAsk = useCallback(
    async (text?: string) => {
      const question = (text ?? input).trim();

      if (!question || loading) return;

      setLastQuestion(question);
      setInput("");

      try {
        await askWellnessCoach(question);
      } catch (error: any) {
        toast.error({
          title: "Viora AI",
          message:
            error?.message || "Unable to contact Viora AI. Please try again.",
        });
      }
    },
    [askWellnessCoach, input, loading, toast]
  );

  const handleNewChat = useCallback(() => {
    startNewConversation();
    setShowHistory(false);

    toast.info({
      title: t(T.ai.newChatStarted),
      message: t(T.ai.freshConversation),
    });
  }, [startNewConversation, toast]);

  const handleOpenConversation = useCallback(
    async (conversationId: string) => {
      await openConversation(conversationId);
      setShowHistory(false);
    },
    [openConversation]
  );

  const handleRetry = useCallback(() => {
    if (!lastQuestion || loading) return;
    handleAsk(lastQuestion);
  }, [handleAsk, lastQuestion, loading]);

  const handleDashboard = useCallback(() => {
    router.replace("/dashboard" as any);
  }, []);

  return (
    <Screen>
      <View style={styles.topShell}>
        <View style={styles.topBar}>
          <CommonBackButton compact />

          <View style={styles.centerTitle}>
            <View style={styles.titleIcon}>
              <Brain size={18} color={colors.white} />
            </View>

            <View>
              <Text style={styles.screenTitle}>{t(T.ai.title)}</Text>
              <Text style={styles.screenSubtitle}>{t("ai.subtitle")}</Text>
            </View>
          </View>

          <Pressable
            onPress={handleDashboard}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go to dashboard"
          >
            <Home size={19} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroIcon}>
              <Sparkles size={22} color={colors.primary} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Your personal wellness coach</Text>
              <Text style={styles.heroSubtitle}>
                Ask about sleep, hydration, stress, yoga, mood, or today&apos;s
                wellness score.
              </Text>
            </View>
          </View>

          <View style={styles.memoryBadge}>
            <Brain size={15} color={colors.primary} />
            <Text style={styles.memoryText}>
              Uses your wellness memory and daily progress
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actionRow}>
          <Pressable
            onPress={handleNewChat}
            style={styles.primaryAction}
            accessibilityRole="button"
            accessibilityLabel="Start new AI chat"
          >
            <Plus size={17} color={colors.white} />
            <Text style={styles.primaryActionText}>New Chat</Text>
          </Pressable>

          <Pressable
            onPress={() => setShowHistory((prev) => !prev)}
            style={styles.secondaryAction}
            accessibilityRole="button"
            accessibilityLabel="Show AI chat history"
          >
            <Clock3 size={17} color={colors.primary} />
            <Text style={styles.secondaryActionText}>
              {showHistory ? "Hide History" : "History"}
            </Text>
          </Pressable>
        </View>

        {showHistory ? (
          <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View>
                <Text style={styles.historyTitle}>Chat History</Text>
                <Text style={styles.historySubtitle}>
                  Continue where you left off
                </Text>
              </View>

              <Text style={styles.historyCount}>{threads.length}</Text>
            </View>

            {threads.length === 0 ? (
              <View style={styles.historyEmptyBox}>
                <MessageCircle size={20} color={colors.mutedText} />
                <Text style={styles.historyEmpty}>No previous chats yet.</Text>
              </View>
            ) : (
              threads.map((thread) => {
                const isActive =
                  thread.conversationId === activeConversationId;

                return (
                  <Pressable
                    key={thread.conversationId}
                    onPress={() =>
                      handleOpenConversation(thread.conversationId)
                    }
                    style={[
                      styles.threadItem,
                      isActive && styles.activeThreadItem,
                    ]}
                  >
                    <View style={styles.threadIcon}>
                      <MessageCircle
                        size={17}
                        color={isActive ? colors.primary : colors.mutedText}
                      />
                    </View>

                    <View style={styles.threadTextWrap}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.threadTitle,
                          isActive && styles.activeThreadText,
                        ]}
                      >
                        {thread.title}
                      </Text>

                      <Text numberOfLines={1} style={styles.threadSubtitle}>
                        {thread.lastMessage}
                      </Text>
                    </View>

                    <View style={styles.threadMeta}>
                      <Text style={styles.threadDate}>
                        {formatThreadDate(thread.updatedAt)}
                      </Text>
                      <Text style={styles.threadCount}>
                        {thread.messageCount} msgs
                      </Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        ) : null}

        <AIContextSnapshotCard snapshot={contextSnapshot} />

        <AICoachQuickActionGrid
          actions={quickActions}
          disabled={loading || contextLoading}
          onPress={handleAsk}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.suggestions}>
            {suggestions.map((item) => (
              <AISuggestionCard
                key={item}
                title={item}
                onPress={() => handleAsk(item)}
                disabled={loading}
              />
            ))}
          </View>
        </ScrollView>

        <View style={styles.chatPanel}>
          {historyLoading ? (
            <LoadingState
              title="Loading AI history"
              message="Fetching your recent conversation with Viora."
            />
          ) : historyError ? (
            <ErrorState
              title="Unable to load history"
              message={historyError}
              onRetry={reloadHistory}
            />
          ) : messages.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Brain size={28} color={colors.primary} />
              </View>

              <Text style={styles.emptyTitle}>Start a wellness conversation</Text>
              <Text style={styles.emptyText}>
                Viora can help you understand your habits, daily score, stress
                patterns, and next best wellness step.
              </Text>
            </View>
          ) : (
            <View style={styles.messagesWrap}>
              {messages.map((item) => (
                <AIMessageBubble
                  key={item.id}
                  role={item.role}
                  message={item.message}
                />
              ))}

              {loading && <AITypingIndicator />}
            </View>
          )}
        </View>

        <AICoachFollowUpChips
          suggestions={followUps}
          disabled={loading}
          onPress={handleAsk}
        />

        {!loading && lastQuestion ? (
          <Pressable
            onPress={handleRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry last AI question"
          >
            <Text style={styles.retryText}>Retry last question</Text>
          </Pressable>
        ) : null}

        <AIInputBar
          value={input}
          onChangeText={setInput}
          onSend={() => handleAsk()}
          disabled={loading}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topShell: {
    paddingTop: 54,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  titleIcon: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    marginTop: 1,
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  heroCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  heroHeader: {
    flexDirection: "row",
    gap: spacing.md,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  memoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.softGreen,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  memoryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  content: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 40,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  historyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  historySubtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  historyCount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  historyEmptyBox: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  historyEmpty: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: "700",
  },
  threadItem: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  activeThreadItem: {
    backgroundColor: "#ECFDF5",
    borderColor: colors.primary,
  },
  threadIcon: {
    width: 36,
    height: 36,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  threadTextWrap: {
    flex: 1,
  },
  threadTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  activeThreadText: {
    color: colors.primary,
  },
  threadSubtitle: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "600",
  },
  threadMeta: {
    alignItems: "flex-end",
  },
  threadDate: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
  },
  threadCount: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: "800",
  },
  suggestions: {
    flexDirection: "row",
  },
  chatPanel: {
    minHeight: 240,
  },
  messagesWrap: {
    gap: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  emptyText: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    alignSelf: "center",
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  retryText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
});