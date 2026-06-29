import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "../common";
import { colors, radius, spacing, typography } from "../../theme";
import { GoalSuggestion } from "../../types";

type GoalSuggestionListProps = {
  suggestions: GoalSuggestion[];
  saving: boolean;
  onApply: (suggestion: GoalSuggestion) => void;
};

export function GoalSuggestionList({ suggestions, saving, onApply }: GoalSuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <AppCard>
        <Text style={styles.emptyTitle}>Suggestions are up to date</Text>
        <Text style={styles.emptyText}>Viora will generate new suggestions as your activity and AI memory grows.</Text>
      </AppCard>
    );
  }

  return (
    <View style={styles.list}>
      {suggestions.map((suggestion) => (
        <AppCard key={suggestion.id}>
          <View style={styles.header}>
            <Text style={styles.badge}>{suggestion.type === "goal" ? "Goal" : "Habit"}</Text>
            <Text style={styles.category}>{suggestion.category}</Text>
          </View>
          <Text style={styles.title}>{suggestion.title}</Text>
          <Text style={styles.description}>{suggestion.description}</Text>
          <Pressable disabled={saving} onPress={() => onApply(suggestion)} style={styles.action}>
            <Text style={styles.actionText}>{saving ? "Saving..." : suggestion.actionLabel}</Text>
          </Pressable>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  category: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  title: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  description: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
  action: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    alignItems: "center",
  },
  actionText: {
    color: colors.white,
    fontWeight: "900",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});
