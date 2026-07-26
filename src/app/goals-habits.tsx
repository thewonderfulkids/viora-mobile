import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Target } from "lucide-react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen } from "../components/common";
import { PremiumJourneyHero } from "../components/premiumExperience";
import {
  GoalHabitHero,
  GoalHabitInsights,
  GoalHabitSection,
  GoalHabitStatGrid,
  GoalList,
  GoalSuggestionList,
  HabitList,
} from "../components/goalsHabits";
import { useGoalHabitDashboard } from "../hooks";
import { colors, spacing, typography } from "../theme";

export default function GoalsHabitsScreen() {
  const {
    dashboard,
    loading,
    refreshing,
    saving,
    error,
    todayCompletedHabitIds,
    refresh,
    applySuggestion,
    increaseGoalProgress,
    completeHabit,
    archiveGoal,
    archiveHabit,
  } = useGoalHabitDashboard();

  if (loading) {
    return <LoadingState message="Loading your goals and habits..." />;
  }

  if (error && !dashboard) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  if (!dashboard) {
    return <ErrorState message="Goals and habits are not available right now." onRetry={refresh} />;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton />

        <PremiumJourneyHero
          eyebrow="Goals & Habits"
          title="Small actions. Visible momentum."
          subtitle="Build measurable goals and repeatable routines, then let Viora connect consistency with your wider wellness progress."
          icon={<Target size={29} color="#0F766E" />}
          colors={["#064E3B", "#0F766E", "#14B8A6"]}
          chips={["Daily streaks", "Goal forecasts", "AI coaching"]}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <GoalHabitHero dashboard={dashboard} />
        <GoalHabitStatGrid stats={dashboard.statistics} />

        <GoalHabitSection
          title="Active Goals"
          subtitle="Track progress toward measurable outcomes."
        >
          <GoalList
            goals={dashboard.activeGoals}
            predictions={dashboard.predictions}
            saving={saving}
            onIncreaseProgress={increaseGoalProgress}
            onArchive={archiveGoal}
          />
        </GoalHabitSection>

        <GoalHabitSection
          title="Daily Habits"
          subtitle="Complete small routines that power your AI memory and wellness intelligence."
        >
          <HabitList
            habits={dashboard.activeHabits}
            completedHabitIds={todayCompletedHabitIds}
            saving={saving}
            onComplete={completeHabit}
            onArchive={archiveHabit}
          />
        </GoalHabitSection>

        <GoalHabitSection
          title="AI Insights"
          subtitle="Generated from your goals, habits and completion rhythm."
        >
          <GoalHabitInsights insights={dashboard.insights} />
        </GoalHabitSection>

        <GoalHabitSection
          title="Personalized Suggestions"
          subtitle="One-tap goal and habit templates for a stronger wellness routine."
        >
          <GoalSuggestionList
            suggestions={dashboard.suggestions}
            saving={saving}
            onApply={applySuggestion}
          />
        </GoalHabitSection>

        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>AI Coach Context</Text>
          <Text style={styles.contextText}>{dashboard.aiCoachContext}</Text>
          <Text style={styles.contextLink} onPress={() => router.push({ pathname: "/ai-coach" as never })}>
            Open AI Coach →
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 40,
    gap: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    ...typography.caption,
  },
  contextCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
  },
  contextTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  contextText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
  contextLink: {
    marginTop: spacing.md,
    color: colors.primary,
    fontWeight: "900",
  },
});