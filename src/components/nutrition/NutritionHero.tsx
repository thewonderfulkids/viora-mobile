import { LinearGradient } from "expo-linear-gradient";
import { Apple, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { NutritionDashboard } from "../../types";

function trendLabel(trend: NutritionDashboard["monthlyTrend"]) {
  if (trend === "improving") return "Improving";
  if (trend === "needs_attention") return "Needs attention";
  return "Stable";
}

type NutritionHeroProps = {
  dashboard: NutritionDashboard;
};

export function NutritionHero({ dashboard }: NutritionHeroProps) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconShell}>
          <Apple size={24} color={colors.white} />
        </View>

        <View style={styles.scorePill}>
          <TrendingUp size={14} color={colors.mint} />
          <Text style={styles.scorePillText}>{trendLabel(dashboard.monthlyTrend)}</Text>
        </View>
      </View>

      <Text style={styles.kicker}>Nutrition Intelligence</Text>
      <Text style={styles.score}>{dashboard.nutritionScore}%</Text>
      <Text style={styles.title}>Today's nutrition score</Text>
      <Text style={styles.summary}>{dashboard.summary.aiSummary}</Text>

      <View style={styles.footerGrid}>
        <View style={styles.footerTile}>
          <Text style={styles.footerValue}>{dashboard.mealBalanceScore}%</Text>
          <Text style={styles.footerLabel}>Meal balance</Text>
        </View>
        <View style={styles.footerTile}>
          <Text style={styles.footerValue}>{dashboard.weeklyAverageScore}%</Text>
          <Text style={styles.footerLabel}>Weekly avg</Text>
        </View>
        <View style={styles.footerTile}>
          <Text style={styles.footerValue}>{dashboard.healthyEatingStreak}</Text>
          <Text style={styles.footerLabel}>Healthy streak</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  iconShell: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.mint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  scorePillText: {
    color: colors.softGreen,
    fontSize: 12,
    fontWeight: "900",
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  score: {
    marginTop: spacing.sm,
    color: colors.white,
    fontSize: 58,
    lineHeight: 66,
    fontWeight: "900",
    letterSpacing: -2,
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
  },
  summary: {
    marginTop: spacing.sm,
    color: colors.softGreen,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  footerGrid: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerTile: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(255,255,255,0.10)",
    padding: spacing.md,
  },
  footerValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "900",
  },
  footerLabel: {
    marginTop: 3,
    color: colors.softGreen,
    fontSize: 11,
    fontWeight: "800",
  },
});
