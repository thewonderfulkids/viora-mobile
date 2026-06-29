import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { NutritionMetric } from "../../types";

type NutritionMetricGridProps = {
  metrics: NutritionMetric[];
};

function toneColor(tone: NutritionMetric["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.teal;
}

export function NutritionMetricGrid({ metrics }: NutritionMetricGridProps) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric) => (
        <View key={metric.id} style={styles.card}>
          <View style={[styles.dot, { backgroundColor: toneColor(metric.tone) }]} />
          <Text style={styles.label}>{metric.label}</Text>
          <Text style={styles.value}>{metric.value}</Text>
          <Text style={styles.helper}>{metric.helper}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  card: {
    width: "47%",
    minWidth: 150,
    flexGrow: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginBottom: spacing.sm,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "900",
  },
  value: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 23,
    fontWeight: "900",
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});
