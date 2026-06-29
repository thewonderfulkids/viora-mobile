import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { ErrorState, LoadingState, Screen } from "../components/common";
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
import { useWellnessIntelligence } from "../hooks/useWellnessIntelligence";
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <ArrowLeft size={18} color={colors.primaryDark} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

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
    paddingTop: 58,
    paddingBottom: 42,
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
    borderRadius: 999,
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
});
