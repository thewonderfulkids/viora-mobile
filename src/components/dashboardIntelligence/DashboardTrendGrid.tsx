import { StyleSheet, Text, View } from "react-native";

import { DashboardTrendMetric } from "../../types/dashboardIntelligence";
import { colors, radius, spacing } from "../../theme";

function progressColor(priority: DashboardTrendMetric["priority"]) {
  if (priority === "high") return colors.danger;
  if (priority === "medium") return colors.warning;
  return colors.primary;
}

export function DashboardTrendGrid({ trends }: { trends: DashboardTrendMetric[] }) {
  return (
    <View style={styles.grid}>
      {trends.map((trend) => (
        <View key={trend.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>{trend.label}</Text>
            <Text style={[styles.value, { color: progressColor(trend.priority) }]}>{trend.value}</Text>
          </View>
          <Text style={styles.detail}>{trend.detail}</Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${trend.progress}%`, backgroundColor: progressColor(trend.priority) },
              ]}
            />
          </View>
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
    minWidth: 150,
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  value: {
    fontSize: 16,
    fontWeight: "900",
  },
  detail: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.softGreen,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
