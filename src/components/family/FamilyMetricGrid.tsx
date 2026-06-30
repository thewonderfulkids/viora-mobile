import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { FamilyDashboardMetric } from "../../types";

type Props = { metrics: FamilyDashboardMetric[] };

function toneColor(tone: FamilyDashboardMetric["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.mutedText;
}

export function FamilyMetricGrid({ metrics }: Props) {
  return (
    <View style={styles.grid}>
      {metrics.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={[styles.value, { color: toneColor(item.tone) }]}>{item.value}</Text>
          <Text style={styles.helper}>{item.helper}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  label: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    marginTop: spacing.xs,
    fontSize: 28,
    fontWeight: "900",
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
