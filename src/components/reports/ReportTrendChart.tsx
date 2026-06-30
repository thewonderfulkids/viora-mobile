import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";
import { ReportTrendPoint } from "../../types";

type ReportTrendChartProps = {
  points: ReportTrendPoint[];
};

export function ReportTrendChart({ points }: ReportTrendChartProps) {
  if (!points.length) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Add more activity to generate chart data.</Text>
      </View>
    );
  }

  const max = Math.max(...points.map((item) => item.value), 1);

  return (
    <View style={styles.container}>
      {points.map((item) => {
        const height = Math.max(12, Math.round((item.value / max) * 96));
        return (
          <View key={item.id} style={styles.barItem}>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height }]} />
            </View>
            <Text numberOfLines={1} style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  barTrack: {
    height: 104,
    width: "100%",
    justifyContent: "flex-end",
    borderRadius: 999,
    backgroundColor: colors.softGreen,
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: "800",
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.mutedText,
    fontWeight: "800",
  },
});
