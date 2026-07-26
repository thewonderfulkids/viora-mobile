import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { CommonBackButton, ErrorState, LoadingState, Screen, SectionHeader } from "../components/common";
import {
  NutritionFoodLogger,
  NutritionHero,
  NutritionInsightList,
  NutritionMealList,
  NutritionMetricGrid,
  NutritionSection,
  NutritionSuggestionList,
  NutritionTimeline,
} from "../components/nutrition";
import { useNutrition } from "../hooks";
import { colors, spacing } from "../theme";

export default function NutritionScreen() {
  const {
    dashboard,
    loading,
    refreshing,
    saving,
    error,
    refresh,
    addEntry,
    addSuggestion,
    increasePortion,
    reducePortion,
    deleteEntry,
  } = useNutrition();

  if (loading && !dashboard) {
    return <LoadingState message="Building your nutrition intelligence..." />;
  }

  if (error && !dashboard) {
    return <ErrorState title="Unable to load nutrition" message={error} onRetry={refresh} />;
  }

  if (!dashboard) {
    return <ErrorState message="Nutrition intelligence is not available right now." onRetry={refresh} />;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton />

        <SectionHeader
          label="Nutrition"
          title="Nutrition Intelligence"
          subtitle="Log real food items under breakfast, lunch, dinner and snacks. Viora calculates calories, protein, sugar and sodium from the item-level breakdown."
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <NutritionHero dashboard={dashboard} />

        <NutritionSection
          title="Add Food Item"
          subtitle="Select actual foods like tea, sugar, bread, dal, roti or rice. Quantity controls the calories."
        >
          <NutritionFoodLogger
            presets={dashboard.foodPresets}
            saving={saving}
            onAddEntry={addEntry}
          />
        </NutritionSection>

        <NutritionSection
          title="Daily Nutrition Summary"
          subtitle="Calories, protein, sugar, fiber and meal balance generated from your logged food items."
        >
          <NutritionMetricGrid metrics={dashboard.metrics} />
        </NutritionSection>

        <NutritionSection
          title="Meal Tracking"
          subtitle="Each meal now shows exactly what you ate and how much every item contributed."
        >
          <NutritionMealList
            groups={dashboard.mealGroups}
            saving={saving}
            onIncreasePortion={increasePortion}
            onReducePortion={reducePortion}
            onDeleteEntry={deleteEntry}
          />
        </NutritionSection>

        <NutritionSection
          title="AI Nutrition Insights"
          subtitle="Protein gaps, tea sugar, sodium risk and meal consistency detection."
        >
          <NutritionInsightList insights={dashboard.insights} />
        </NutritionSection>

        <NutritionSection
          title="Personalized Meal Suggestions"
          subtitle="One-tap itemized meals. Future-ready for barcode scanner, OCR and food vision AI."
        >
          <NutritionSuggestionList
            suggestions={dashboard.suggestions}
            saving={saving}
            onApply={addSuggestion}
          />
        </NutritionSection>

        <NutritionSection
          title="Nutrition Timeline"
          subtitle="Recent food events and AI-generated nutrition score history."
        >
          <NutritionTimeline items={dashboard.timeline} />
        </NutritionSection>

        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>Connected AI Context</Text>
          <Text style={styles.contextText}>{dashboard.aiCoachContext}</Text>
          <Text style={styles.contextText}>{dashboard.wellnessIntelligenceContext}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: 32,
    paddingBottom: 42,
    gap: spacing.xl,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
  },
  contextCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.softGreen,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  contextTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  contextText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
