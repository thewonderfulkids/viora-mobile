import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen, SectionHeader } from "../components/common";
import {
  CopingSuggestionList,
  MentalInsightList,
  MentalMetricGrid,
  MentalWellnessHero,
  MentalWellnessSection,
  MoodCheckInCard,
  MoodEntryList,
  MoodTimeline,
} from "../components/mentalWellness";
import { useMentalWellness } from "../hooks";
import { colors, radius, spacing, typography } from "../theme";

export default function MentalWellnessScreen() {
  const {
    dashboard,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    saveCheckIn,
    saveSuggestion,
    deleteCheckIn,
  } = useMentalWellness();

  if (loading && !dashboard) {
    return <LoadingState message="Loading mental wellness intelligence..." />;
  }

  if (error && !dashboard) {
    return <ErrorState title="Unable to load mental wellness" message={error} onRetry={refresh} />;
  }

  if (!dashboard) {
    return <ErrorState message="Mental wellness intelligence is not available right now." onRetry={refresh} />;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton />

        <SectionHeader
          label="Sprint 17"
          title="Mental Wellness & Mood Intelligence"
          subtitle="Track mood, stress, emotions, triggers and coping actions. Viora connects mental wellness with AI Coach, reports and future voice commands."
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <MentalWellnessHero dashboard={dashboard} />

        <MentalWellnessSection
          title="Mood Check-in"
          subtitle="Log what you actually feel: mood, stress, energy, emotions, triggers and what helped."
        >
          <MoodCheckInCard saving={saving} onSave={saveCheckIn} />
        </MentalWellnessSection>

        <MentalWellnessSection
          title="Mental Wellness Metrics"
          subtitle="AI-generated emotional balance, mood, stress safety and check-in consistency."
        >
          <MentalMetricGrid metrics={dashboard.metrics} />
        </MentalWellnessSection>

        <MentalWellnessSection
          title="AI Mood Insights"
          subtitle="Pattern detection from your latest check-ins, triggers and coping actions."
        >
          <MentalInsightList insights={dashboard.insights} />
        </MentalWellnessSection>

        <MentalWellnessSection
          title="Coping Suggestions"
          subtitle="One-tap mental wellness routines ready for smart reminders and future voice commands."
        >
          <CopingSuggestionList suggestions={dashboard.suggestions} saving={saving} onApply={saveSuggestion} />
        </MentalWellnessSection>

        <MentalWellnessSection
          title="Recent Check-ins"
          subtitle="Your mood history creates context for AI Coach, wellness intelligence and reports."
        >
          <MoodEntryList entries={dashboard.entries} saving={saving} onDelete={deleteCheckIn} />
        </MentalWellnessSection>

        <MentalWellnessSection
          title="Mood Timeline"
          subtitle="Recent emotional signals and stress events saved to your mental wellness timeline."
        >
          <MoodTimeline items={dashboard.timeline} />
        </MentalWellnessSection>

        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>Connected AI Context</Text>
          <Text style={styles.contextText}>{dashboard.aiCoachContext}</Text>
          <Text style={styles.contextText}>{dashboard.voiceCommandContext}</Text>
        </View>
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
  errorText: {
    color: colors.danger,
    ...typography.caption,
  },
  contextCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  contextTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  contextText: {
    color: colors.mutedText,
    ...typography.caption,
  },
});
