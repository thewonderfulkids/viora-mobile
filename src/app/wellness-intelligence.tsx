import { Brain, Sparkles } from "lucide-react-native";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import {
  WellnessInsightList,
  WellnessIntelligenceHero,
  WellnessIntelligenceSection,
  WellnessMetricGrid,
  WellnessRecommendationList,
  WellnessRiskList,
  WellnessStatisticGrid,
  WellnessTimeline,
} from "../components/wellnessIntelligence";
import { useWellnessIntelligence } from "../hooks";
import { colors, spacing } from "../theme";

export default function WellnessIntelligenceScreen() {
  const { intelligence, loading, refreshing, error, refresh } = useWellnessIntelligence();

  if (loading && !intelligence) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <LoadingState message="Generating AI wellness intelligence..." />
        </View>
      </Screen>
    );
  }

  if (error && !intelligence) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <ErrorState title="Unable to load wellness intelligence" message={error} onRetry={refresh} />
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
        <View style={styles.topBar}>
          <CommonBackButton />

          <View style={styles.statusPill}>
            <Sparkles size={14} color={colors.primaryDark} />
            <Text style={styles.statusText}>AI Live</Text>
          </View>
        </View>

        <View style={styles.premiumHeader}>
          <View style={styles.iconShell}>
            <Brain size={24} color={colors.white} />
          </View>

          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Viora Intelligence</Text>
            <Text style={styles.title}>Your wellness system, interpreted by AI.</Text>
            <Text style={styles.subtitle}>
              Viora reads your activity, hydration, sleep, yoga and memory signals to turn raw habits into clear next steps.
            </Text>
          </View>
        </View>

        {intelligence ? (
          <>
            <WellnessIntelligenceHero
              dailyWellnessIndex={intelligence.dailyWellnessIndex}
              weeklyAverageScore={intelligence.weeklyAverageScore}
              riskLevel={intelligence.riskLevel}
              primaryFocus={intelligence.primaryFocus}
              summary={intelligence.summary}
            />

            <WellnessIntelligenceSection
              title="Learning Statistics"
              subtitle="Live AI metrics generated from today's dashboard, recent dailyStats, AI memory and conversation summaries."
            >
              <WellnessStatisticGrid statistics={intelligence.statistics} />
            </WellnessIntelligenceSection>

            <WellnessIntelligenceSection
              title="Wellness Score Engine"
              subtitle="A reusable scoring layer for hydration, sleep, yoga, music, risk detection and future premium analytics."
            >
              <WellnessMetricGrid metrics={intelligence.metrics} />
            </WellnessIntelligenceSection>

            <WellnessIntelligenceSection
              title="Personalized Insights"
              subtitle="Pattern detection built from repository data and AI memory context."
            >
              <WellnessInsightList insights={intelligence.insights} />
            </WellnessIntelligenceSection>

            <WellnessIntelligenceSection
              title="Risk Detection"
              subtitle="Early signals for imbalance across sleep, hydration, stress and routine consistency."
            >
              <WellnessRiskList risks={intelligence.risks} />
            </WellnessIntelligenceSection>

            <WellnessIntelligenceSection
              title="Recommended Actions"
              subtitle="Ranked next steps ready for reminders, voice AI, family accounts and smart notifications."
            >
              <WellnessRecommendationList recommendations={intelligence.recommendations} />
            </WellnessIntelligenceSection>

            <WellnessIntelligenceSection
              title="Wellness Timeline Analytics"
              subtitle="Recent score events generated from saved daily wellness activity."
            >
              <WellnessTimeline items={intelligence.timeline} />
            </WellnessIntelligenceSection>
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 36,
    paddingBottom: 42,
    gap: spacing.xl,
  },
  centerState: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  premiumHeader: {
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.softGreen,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
});