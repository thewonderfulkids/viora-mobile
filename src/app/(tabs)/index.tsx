import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Screen } from "../../components/common";
import {
  DashboardAchievementGrid,
  DashboardBriefingCard,
  DashboardFamilySnapshotCard,
  DashboardIntelligenceSection,
  DashboardSmartActionGrid,
  DashboardTimelineCard,
  DashboardTrendGrid,
} from "../../components/dashboardIntelligence";
import { useDashboardIntelligence } from "../../hooks";
import { colors, spacing } from "../../theme";

export default function DashboardScreen() {
  const { intelligence, loading, error, refresh } = useDashboardIntelligence();

  if (loading && !intelligence) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <Text style={styles.loadingText}>Loading your intelligent dashboard...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !intelligence) {
    return (
      <Screen>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error || "Unable to load dashboard"}</Text>
          <Text style={styles.retryText} onPress={refresh}>Tap to retry</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
      >
        <DashboardBriefingCard briefing={intelligence.briefing} />

        <DashboardIntelligenceSection
          title="Live Wellness Analytics"
          subtitle="Your hydration, sleep, movement and mindfulness signals in one AI-ready command center."
        >
          <DashboardTrendGrid trends={intelligence.trends} />
        </DashboardIntelligenceSection>

        <DashboardIntelligenceSection
          title="Smart Actions"
          subtitle="Viora prioritizes actions based on today&apos;s wellness state. Every card opens a working module."
        >
          <DashboardSmartActionGrid actions={intelligence.smartActions} />
        </DashboardIntelligenceSection>

        <DashboardIntelligenceSection
          title="Today&apos;s Timeline"
          subtitle="A guided flow for hydration, nutrition, movement and AI review."
        >
          <DashboardTimelineCard items={intelligence.timeline} />
        </DashboardIntelligenceSection>

        <DashboardFamilySnapshotCard snapshot={intelligence.familySnapshot} />

        <DashboardIntelligenceSection
          title="Achievements & Streak Signals"
          subtitle="Live highlights from your day. These cards will power future badges, challenges and family celebrations."
        >
          <DashboardAchievementGrid achievements={intelligence.achievements} />
        </DashboardIntelligenceSection>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 44,
    paddingBottom: 48,
    gap: spacing.xl,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  errorText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
  retryText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
  },
});
