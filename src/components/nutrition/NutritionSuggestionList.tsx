import { Plus } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { NutritionSuggestion } from "../../types";

type NutritionSuggestionListProps = {
  suggestions: NutritionSuggestion[];
  saving: boolean;
  onApply: (suggestion: NutritionSuggestion) => void;
};

function totalCalories(suggestion: NutritionSuggestion) {
  return suggestion.entry.foodItems.reduce((total, item) => total + item.calories, 0);
}

function totalProtein(suggestion: NutritionSuggestion) {
  return suggestion.entry.foodItems.reduce((total, item) => total + item.protein, 0).toFixed(1);
}

export function NutritionSuggestionList({ suggestions, saving, onApply }: NutritionSuggestionListProps) {
  return (
    <View style={styles.list}>
      {suggestions.map((suggestion) => (
        <View key={suggestion.id} style={styles.card}>
          <View style={styles.copy}>
            <Text style={styles.title}>{suggestion.title}</Text>
            <Text style={styles.description}>{suggestion.description}</Text>
            <Text style={styles.macroLine}>
              {totalCalories(suggestion)} kcal • {totalProtein(suggestion)}g protein • {suggestion.entry.foodItems.length} item{suggestion.entry.foodItems.length === 1 ? "" : "s"}
            </Text>
          </View>

          <Pressable disabled={saving} style={styles.button} onPress={() => onApply(suggestion)}>
            <Plus size={15} color={colors.white} />
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
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
    gap: spacing.md,
  },
  copy: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
  macroLine: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  button: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
});
