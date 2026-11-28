import { useAppTranslation } from "../i18n/useAppTranslation";
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
  const { t } = useAppTranslation();
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
    return <LoadingState message={t("nutrition.loading")} />;
  }

  if (error && !dashboard) {
    return <ErrorState title={t("nutrition.error")} message={error} onRetry={refresh} />;
  }

  if (!dashboard) {
    return <ErrorState message={t("nutrition.unavailable")} onRetry={refresh} />;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
      >
        <CommonBackButton />

        <SectionHeader
          label={t("nutrition.label")}
          title={t("nutrition.title")}
          subtitle={t("nutrition.intro")}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <NutritionHero dashboard={dashboard} />

        <NutritionSection
          title={t("nutrition.add")}
          subtitle={t("nutrition.addHelp")}
        >
          <NutritionFoodLogger
            presets={dashboard.foodPresets}
            saving={saving}
            onAddEntry={addEntry}
          />
        </NutritionSection>

        <NutritionSection
          title={t("nutrition.summary")}
          subtitle={t("nutrition.summaryHelp")}
        >
          <NutritionMetricGrid metrics={dashboard.metrics} />
        </NutritionSection>

        <NutritionSection
          title={t("nutrition.meals")}
          subtitle={t("nutrition.mealsHelp")}
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
          title={t("nutrition.insights")}
          subtitle={t("nutrition.insightsHelp")}
        >
          <NutritionInsightList insights={dashboard.insights} />
        </NutritionSection>

        <NutritionSection
          title={t("nutrition.suggestions")}
          subtitle={t("nutrition.suggestionsHelp")}
        >
          <NutritionSuggestionList
            suggestions={dashboard.suggestions}
            saving={saving}
            onApply={addSuggestion}
          />
        </NutritionSection>

        <NutritionSection
          title={t("nutrition.timeline")}
          subtitle={t("nutrition.timelineHelp")}
        >
          <NutritionTimeline items={dashboard.timeline} />
        </NutritionSection>

        <View style={styles.contextCard}>
          <Text style={styles.contextTitle}>{t("nutrition.context")}</Text>
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
