import { StyleSheet, Text, View } from "react-native";

import { MentalMetric } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

type MentalMetricGridProps = {
  metrics: MentalMetric[];
};

function toneColor(tone: MentalMetric["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.teal;
}

export function MentalMetricGrid({ metrics }: MentalMetricGridProps) {
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
    gap: spacing.xs,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 99,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  helper: {
    color: colors.mutedText,
    ...typography.caption,
  },
});
