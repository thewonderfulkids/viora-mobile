import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";
import { ReportMetric } from "../../types";

type ReportMetricGridProps = {
  metrics: ReportMetric[];
};

function toneColor(tone: ReportMetric["tone"]) {
  if (tone === "positive") return colors.primary;
  if (tone === "warning") return colors.warning;
  return colors.mutedText;
}

export function ReportMetricGrid({ metrics }: ReportMetricGridProps) {
  return (
    <View style={styles.grid}>
      {metrics.map((item) => (
        <View key={item.id} style={styles.card}>
          <Text style={[styles.value, { color: toneColor(item.tone) }]}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.helper}>{item.helper}</Text>
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
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  value: {
    fontSize: 24,
    fontWeight: "900",
  },
  label: {
    marginTop: spacing.xs,
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
});
