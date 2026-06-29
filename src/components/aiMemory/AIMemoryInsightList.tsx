import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { AIMemoryInsight } from "../../types";

type AIMemoryInsightListProps = {
  insights: AIMemoryInsight[];
  emptyText: string;
};

function formatConfidence(value: number) {
  return `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`;
}

export function AIMemoryInsightList({ insights, emptyText }: AIMemoryInsightListProps) {
  if (insights.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>{emptyText}</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {insights.map((insight) => (
        <View key={insight.id} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{insight.title}</Text>
            <Text style={styles.badge}>{formatConfidence(insight.confidence)}</Text>
          </View>
          <Text style={styles.description}>{insight.description}</Text>
          <Text style={styles.source}>{String(insight.source)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
  },
  badge: {
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  source: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
