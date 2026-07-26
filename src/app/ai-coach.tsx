import { router, useLocalSearchParams } from "expo-router";
import {
  Brain,
  Clock3,
  Home,
  MessageCircle,
  Mic,
  Plus,
  Send,
  Square,
  Sparkles,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AICoachFollowUpChips,
  AICoachQuickActionGrid,
  AIContextSnapshotCard,
  AIMessageBubble,
  AISuggestionCard,
  AITypingIndicator,
} from "../components/ai";
import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { useAICoach, useToast, useVoiceAI } from "../hooks";
import { T } from "../i18n";
import { useAppTranslation } from "../i18n/useAppTranslation";
import { colors, radius, spacing } from "../theme";
import { VoiceCommandResult } from "../types";

function formatThreadDate(value: Date | null) {
  if (!value) return "Recently";

  return value.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

function isActionIntent(result: VoiceCommandResult) {
  return [
    "log_hydration",
    "log_nutrition",
    "log_mood",
    "log_sleep",
    "create_goal",
  ].includes(result.intent.type);
}

export default function AIScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const insets = useSafeAreaInsets();
  const messageScrollRef = useRef<ScrollView | null>(null);

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

  const {
    status: voiceStatus,
    saving: voiceSaving,
    speaking,
    error: voiceError,
    startListening,
    submitCommand,
    stopSpeaking,
  } = useVoiceAI({ autoNavigate: false });

  const toast = useToast();
  const { t } = useAppTranslation();

  const [input, setInput] = useState("");
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(!isCompact);
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
    setShowHistory(!isCompact);
  }, [isCompact]);

  useEffect(() => {
    if (params.mode === "voice") {
      setVoiceMode(true);
      setShowHistory(false);
    }
  }, [params.mode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      messageScrollRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timer);
  }, [messages.length, loading]);

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
          message: error?.message || "Unable to contact Viora AI. Please try again.",
        });
      }
    },
    [askWellnessCoach, input, loading, toast]
  );

  const handleNewChat = useCallback(() => {
    startNewConversation();
    setInput("");
    setLastQuestion(null);
    setShowHistory(false);
    setVoiceMode(false);
  }, [startNewConversation]);

  const handleOpenConversation = useCallback(
    async (conversationId: string) => {
      await openConversation(conversationId);
      if (isCompact) setShowHistory(false);
    },
    [isCompact, openConversation]
  );

  const handleRetry = useCallback(() => {
    if (!lastQuestion || loading) return;
    handleAsk(lastQuestion);
  }, [handleAsk, lastQuestion, loading]);

  const handleDashboard = useCallback(() => {
    router.replace("/dashboard" as any);
  }, []);

  const handleVoiceResult = useCallback(
    async (result: VoiceCommandResult | null) => {
      if (!result) return;

      if (
        (result.intent.type === "navigation" || result.intent.type === "read_report") &&
        result.targetRoute
      ) {
        toast.info({ title: result.title, message: result.message });
        router.push({ pathname: result.targetRoute as never });
        return;
      }

      if (isActionIntent(result)) {
        await handleAsk(
          `${result.transcript}\n\nViora understood this as: ${result.message}. Explain what changed and what I should do next.`
        );
        return;
      }

      await handleAsk(result.transcript);
    },
    [handleAsk, toast]
  );

  const handleComposerSend = useCallback(async () => {
    const value = input.trim();
    if (!value) return;

    if (voiceMode) {
      setInput("");
      const result = await submitCommand(value, "manual");
      await handleVoiceResult(result);
      return;
    }

    await handleAsk(value);
  }, [handleAsk, handleVoiceResult, input, submitCommand, voiceMode]);

  const handleStartListening = useCallback(async () => {
    setVoiceMode(true);
    const result = await startListening();
    await handleVoiceResult(result);
  }, [handleVoiceResult, startListening]);

  const renderHistory = () => (
    <View style={[styles.historyPane, isCompact ? styles.historyPaneCompact : styles.historyPaneDesktop]}>
      <View style={styles.historyHeader}>
        <View style={styles.flexOne}>
          <Text style={styles.historyTitle}>Chat History</Text>
          <Text style={styles.historySubtitle}>Continue where you left off</Text>
        </View>
        <Text style={styles.historyCount}>{threads.length}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyList}>
        {threads.length === 0 ? (
          <View style={styles.historyEmptyBox}>
            <MessageCircle size={20} color={colors.mutedText} />
            <Text style={styles.historyEmpty}>No previous chats yet.</Text>
          </View>
        ) : (
          threads.slice(0, isCompact ? 4 : 20).map((thread) => {
            const isActive = thread.conversationId === activeConversationId;

            return (
              <Pressable
                key={thread.conversationId}
                onPress={() => handleOpenConversation(thread.conversationId)}
                style={[styles.threadItem, isActive && styles.activeThreadItem]}
                accessibilityRole="button"
                accessibilityLabel={`Open chat ${thread.title}`}
              >
                <View style={styles.threadIcon}>
                  <MessageCircle size={17} color={isActive ? colors.primary : colors.mutedText} />
                </View>

                <View style={styles.threadTextWrap}>
                  <Text numberOfLines={1} style={[styles.threadTitle, isActive && styles.activeThreadText]}>
                    {thread.title}
                  </Text>
                  <Text numberOfLines={1} style={styles.threadSubtitle}>{thread.lastMessage}</Text>
                </View>

                <View style={styles.threadMeta}>
                  <Text style={styles.threadDate}>{formatThreadDate(thread.updatedAt)}</Text>
                  <Text style={styles.threadCount}>{thread.messageCount} msgs</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topShell}>
          <View style={styles.topBar}>
            <CommonBackButton label="Back" />

            <View style={styles.centerTitle}>
              <View style={styles.titleIcon}>
                <Brain size={18} color={colors.white} />
              </View>

              <View style={styles.titleCopy}>
                <Text style={styles.screenTitle}>{t(T.ai.title)}</Text>
                <Text style={styles.screenSubtitle}>Text + Voice wellness assistant</Text>
              </View>
            </View>

            <Pressable
              onPress={handleDashboard}
              style={styles.homeButton}
              accessibilityRole="button"
              accessibilityLabel="Go to dashboard"
            >
              <Home size={19} color={colors.text} />
            </Pressable>
          </View>

          <View style={[styles.commandBar, isCompact && styles.commandBarCompact]}>
            <Pressable onPress={handleNewChat} style={styles.primaryAction} accessibilityRole="button">
              <Plus size={17} color={colors.white} />
              <Text style={styles.primaryActionText}>New Chat</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowHistory((prev) => !prev)}
              style={styles.secondaryAction}
              accessibilityRole="button"
            >
              <Clock3 size={17} color={colors.primary} />
              <Text style={styles.secondaryActionText}>{showHistory ? "Hide History" : "History"}</Text>
            </Pressable>

            <Pressable
              onPress={() => setVoiceMode((prev) => !prev)}
              style={[styles.secondaryAction, voiceMode && styles.activeVoiceAction]}
              accessibilityRole="button"
            >
              <Mic size={17} color={voiceMode ? colors.white : colors.primary} />
              <Text style={[styles.secondaryActionText, voiceMode && styles.activeVoiceText]}>Voice</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.workspace, isCompact && styles.workspaceCompact]}>
          {showHistory ? renderHistory() : null}

          <View style={styles.chatColumn}>
            <ScrollView
              ref={messageScrollRef}
              style={styles.mainScroll}
              contentContainerStyle={styles.mainContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.assistantCard}>
                <View style={styles.assistantHeader}>
                  <View style={styles.assistantIcon}>
                    {voiceMode ? <Mic size={20} color={colors.white} /> : <Sparkles size={20} color={colors.white} />}
                  </View>

                  <View style={styles.flexOne}>
                    <Text style={styles.assistantTitle}>
                      {voiceMode ? (voiceStatus === "listening" ? "Listening…" : "Voice mode") : "Your personal wellness coach"}
                    </Text>
                    <Text style={styles.assistantSubtitle}>
                      {voiceMode
                        ? voiceStatus === "unsupported"
                          ? "Native voice needs a development build or APK. Typing still works here."
                          : "Tap the mic and speak in Hindi, Hinglish or English."
                        : "Ask about sleep, hydration, stress, yoga, mood, nutrition, reports or today's wellness score."}
                    </Text>
                  </View>

                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{voiceStatus}</Text>
                  </View>
                </View>

                {voiceError ? <Text style={styles.voiceError}>{voiceError}</Text> : null}
              </View>

              <AIContextSnapshotCard snapshot={contextSnapshot} />

              <AICoachQuickActionGrid actions={quickActions} disabled={loading || contextLoading} onPress={handleAsk} />

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.suggestions}>
                  {suggestions.map((item) => (
                    <AISuggestionCard key={item} title={item} onPress={() => handleAsk(item)} disabled={loading} />
                  ))}
                </View>
              </ScrollView>

              <View style={styles.chatPanel}>
                <View style={styles.chatHeader}>
                  <View style={styles.flexOne}>
                    <Text style={styles.chatTitle}>Conversation</Text>
                    <Text style={styles.chatSubtitle}>
                      {messages.length === 0
                        ? "Blank chat ready. Your first message will create this thread."
                        : "Messages stay in this AI Coach conversation."}
                    </Text>
                  </View>
                  <Text style={styles.chatCount}>{messages.length}</Text>
                </View>

                {historyLoading ? (
                  <LoadingState title="Loading AI history" message="Fetching your recent conversation with Viora." />
                ) : historyError ? (
                  <ErrorState title="Unable to load history" message={historyError} onRetry={reloadHistory} />
                ) : messages.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIcon}>
                      <Brain size={28} color={colors.primary} />
                    </View>
                    <Text style={styles.emptyTitle}>New conversation</Text>
                    <Text style={styles.emptyText}>
                      Ask anything or tap the mic. Viora will keep the answer inside this chat.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.messagesWrap}>
                    {messages.map((item) => (
                      <AIMessageBubble key={item.id} role={item.role} message={item.message} />
                    ))}
                    {loading ? <AITypingIndicator /> : null}
                  </View>
                )}
              </View>

              <View style={styles.followUpWrap}>
                <AICoachFollowUpChips suggestions={followUps} disabled={loading} onPress={handleAsk} />

                {!loading && lastQuestion ? (
                  <Pressable onPress={handleRetry} style={styles.retryButton} accessibilityRole="button">
                    <Text style={styles.retryText}>Retry last question</Text>
                  </Pressable>
                ) : null}
              </View>
            </ScrollView>

            <View style={[styles.inputDock, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
              <View style={styles.composer}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder={voiceMode ? "Speak or type: I drank 500 ml water..." : "Ask Viora..."}
                  placeholderTextColor={colors.mutedText}
                  style={styles.composerInput}
                  multiline
                />

                {speaking ? (
                  <Pressable onPress={stopSpeaking} style={styles.micButton} accessibilityRole="button">
                    <Square size={19} color={colors.danger} />
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleStartListening}
                    disabled={voiceSaving}
                    style={[styles.micButton, voiceMode && styles.micButtonActive, voiceSaving && styles.disabledAction]}
                    accessibilityRole="button"
                  >
                    <Mic size={19} color={voiceMode ? colors.white : colors.primary} />
                  </Pressable>
                )}

                <Pressable
                  disabled={loading || voiceSaving || input.trim().length === 0}
                  onPress={handleComposerSend}
                  style={[styles.sendButton, (loading || voiceSaving || input.trim().length === 0) && styles.disabledAction]}
                  accessibilityRole="button"
                >
                  <Send size={20} color={colors.white} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexOne: {
    flex: 1,
  },
  topShell: {
    paddingTop: 36,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  homeButton: {
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
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  titleIcon: {
    width: 38,
    height: 38,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  titleCopy: {
    minWidth: 0,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  screenSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
  },
  commandBar: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
  },
  commandBarCompact: {
    gap: spacing.sm,
  },
  primaryAction: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  primaryActionText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryAction: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
  },
  activeVoiceAction: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  activeVoiceText: {
    color: colors.white,
  },
  workspace: {
    flex: 1,
    flexDirection: "row",
    gap: spacing.lg,
    padding: spacing.xl,
    minHeight: 0,
  },
  workspaceCompact: {
    flexDirection: "column",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  historyPane: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  historyPaneDesktop: {
    width: 360,
    maxWidth: 390,
  },
  historyPaneCompact: {
    width: "100%",
    maxHeight: 350,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  historyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  historySubtitle: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "700",
  },
  historyCount: {
    color: colors.primary,
    fontSize: 21,
    fontWeight: "900",
  },
  historyList: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  historyEmptyBox: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  historyEmpty: {
    color: colors.mutedText,
    fontWeight: "700",
  },
  threadItem: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  activeThreadItem: {
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  threadIcon: {
    width: 42,
    height: 42,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  threadTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  threadTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  activeThreadText: {
    color: colors.primaryDark,
  },
  threadSubtitle: {
    marginTop: 2,
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  threadMeta: {
    alignItems: "flex-end",
    gap: 3,
  },
  threadDate: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "900",
  },
  threadCount: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
  },
  chatColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  mainScroll: {
    flex: 1,
    minHeight: 0,
  },
  mainContent: {
    gap: spacing.lg,
    paddingBottom: spacing.md,
  },
  assistantCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  assistantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  assistantIcon: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  assistantSubtitle: {
    marginTop: 3,
    color: colors.softGreen,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  statusPill: {
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  voiceError: {
    marginTop: spacing.md,
    color: colors.warning,
    fontWeight: "900",
  },
  suggestions: {
    flexDirection: "row",
  },
  chatPanel: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  chatTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  chatSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
  },
  chatCount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
  },
  emptyCard: {
    minHeight: 190,
    borderRadius: radius.xxl,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 24,
    backgroundColor: colors.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.mutedText,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
  },
  messagesWrap: {
    gap: spacing.sm,
  },
  followUpWrap: {
    gap: spacing.md,
  },
  retryButton: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontWeight: "900",
  },
  inputDock: {
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  composer: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    outlineStyle: "none" as any,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  micButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledAction: {
    opacity: 0.45,
  },
});
