import { router } from "expo-router";
import { ArrowLeft, Brain, Sparkles } from "lucide-react-native";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { AIMemoryConversationList } from "../components/aiMemory/AIMemoryConversationList";
import { AIMemoryInsightList } from "../components/aiMemory/AIMemoryInsightList";
import { AIMemoryRecommendationList } from "../components/aiMemory/AIMemoryRecommendationList";
import { AIMemoryRecordList } from "../components/aiMemory/AIMemoryRecordList";
import { AIMemorySection } from "../components/aiMemory/AIMemorySection";
import { AIMemoryStatGrid } from "../components/aiMemory/AIMemoryStatGrid";
import { AIMemoryTimeline } from "../components/aiMemory/AIMemoryTimeline";
import { ErrorState, LoadingState, Screen } from "../components/common";
import { useAIMemoryDashboard } from "../hooks/useAIMemoryDashboard";
import { colors, radius, spacing } from "../theme";

function goBackSafe() {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/profile");
}

export default function AIMemoryScreen() {
  const { data, loading, refreshing, error, refresh } = useAIMemoryDashboard();

  if (loading && !data) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <LoadingState message="Loading AI memory dashboard..." />
        </View>
      </Screen>
    );
  }

  if (error && !data) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <ErrorState title="Unable to load AI memory" message={error} onRetry={refresh} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <TouchableOpacity style={styles.backButton} onPress={goBackSafe} activeOpacity={0.85}>
          <ArrowLeft size={18} color={colors.primaryDark} />
          <Text style={styles.backText}>Profile</Text>
        </TouchableOpacity>

        {data ? (
          <>
            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.heroIcon}>
                  <Brain size={26} color={colors.white} />
                </View>

                <View style={styles.heroCopy}>
                  <Text style={styles.kicker}>Viora AI Memory</Text>
                  <Text style={styles.heroTitle}>Your wellness intelligence is learning with you.</Text>
                  <Text style={styles.heroSubtitle}>
                    Viora stores useful habit signals, wellness patterns and AI conversation context to personalize coaching, reports and future voice AI.
                  </Text>
                </View>
              </View>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{data.memoryCount}</Text>
                  <Text style={styles.heroStatLabel}>Memories</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{Math.round(data.confidenceAverage)}%</Text>
                  <Text style={styles.heroStatLabel}>Confidence</Text>
                </View>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{data.highPriorityCount}</Text>
                  <Text style={styles.heroStatLabel}>Priority</Text>
                </View>
              </View>

              <View style={styles.livePill}>
                <Sparkles size={14} color={colors.primaryDark} />
                <Text style={styles.liveText}>AI memory active</Text>
              </View>
            </View>

            <AIMemorySection
              title="AI Learning Statistics"
              subtitle="Production memory metrics generated from saved user memory, AI summaries and wellness profile context."
            >
              <AIMemoryStatGrid stats={data.statistics} />
            </AIMemorySection>

            <AIMemorySection
              title="Learned Habits"
              subtitle="Signals Viora can reuse for coaching, reminders and future personalized planning."
            >
              <AIMemoryRecordList
                memories={data.learnedHabits}
                emptyText="No learned habits yet. Hydration, sleep, yoga, music and AI coach activity will build this section."
              />
            </AIMemorySection>

            <AIMemorySection
              title="Wellness Patterns"
              subtitle="Grouped patterns across activity sources with confidence scoring."
            >
              <AIMemoryInsightList
                insights={data.wellnessPatterns}
                emptyText="Viora needs more wellness activity to detect strong patterns."
              />
            </AIMemorySection>

            <AIMemorySection
              title="Conversation Memory"
              subtitle="Recent AI Coach summaries and extracted topics."
            >
              <AIMemoryConversationList conversations={data.conversationMemories} />
            </AIMemorySection>

            <AIMemorySection
              title="Weekly Insights"
              subtitle="Current-week learning updates based on recent memory changes."
            >
              <AIMemoryInsightList
                insights={data.weeklyInsights}
                emptyText="Weekly insights will appear after recent activity or AI conversations."
              />
            </AIMemorySection>

            <AIMemorySection
              title="Personalized Recommendations"
              subtitle="Memory-ranked next actions ready for premium, notifications and voice AI."
            >
              <AIMemoryRecommendationList recommendations={data.recommendations} />
            </AIMemorySection>

            <AIMemorySection
              title="Memory Timeline"
              subtitle="A chronological view of memory creation, reinforcement and profile learning."
            >
              <AIMemoryTimeline items={data.timeline} />
            </AIMemorySection>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 46,
    gap: spacing.xl,
  },
  centerState: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "900",
  },
  hero: {
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryDark,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  heroTop: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.mint,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: colors.softGreen,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "700",
  },
  heroStats: {
    flexDirection: "row",
    gap: spacing.md,
  },
  heroStat: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  heroStatValue: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },
  heroStatLabel: {
    marginTop: 2,
    color: colors.softGreen,
    fontSize: 11,
    fontWeight: "800",
  },
  livePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  liveText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
});