import { Pressable, StyleSheet, Text, View } from "react-native";

import { CopingSuggestion } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

type CopingSuggestionListProps = {
  suggestions: CopingSuggestion[];
  saving: boolean;
  onApply: (suggestion: CopingSuggestion) => Promise<void> | void;
};

export function CopingSuggestionList({ suggestions, saving, onApply }: CopingSuggestionListProps) {
  return (
    <View style={styles.list}>
      {suggestions.map((suggestion) => (
        <View key={suggestion.id} style={styles.card}>
          <View style={styles.copy}>
            <Text style={styles.title}>{suggestion.title}</Text>
            <Text style={styles.description}>{suggestion.description}</Text>
            <Text style={styles.meta}>Action: {suggestion.recommendedAction.replace(/_/g, " ")}</Text>
          </View>
          <Pressable disabled={saving} style={[styles.button, saving && styles.disabled]} onPress={() => onApply(suggestion)}>
            <Text style={styles.buttonText}>{suggestion.actionLabel}</Text>
          </Pressable>
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
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  copy: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    ...typography.caption,
  },
  meta: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "900",
  },
});
