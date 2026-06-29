import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";
import { AIMemoryRecommendation } from "../../types/aiMemory";

type AIMemoryRecommendationListProps = {
  recommendations: AIMemoryRecommendation[];
};

export function AIMemoryRecommendationList({ recommendations }: AIMemoryRecommendationListProps) {
  if (recommendations.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyText}>Recommendations will unlock as Viora learns more from your wellness activity.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {recommendations.map((recommendation) => (
        <View key={recommendation.id} style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{recommendation.title}</Text>
            <Text style={styles.priority}>{recommendation.priority}</Text>
          </View>
          <Text style={styles.description}>{recommendation.description}</Text>
          <Text style={styles.action}>{recommendation.actionLabel}</Text>
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
  priority: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  description: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  action: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
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
