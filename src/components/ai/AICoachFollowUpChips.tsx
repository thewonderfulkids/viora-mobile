import { Pressable, StyleSheet, Text, View } from "react-native";
import { AICoachFollowUpSuggestion } from "../../types";
import { colors, radius, spacing } from "../../theme";

type Props = {
  suggestions: AICoachFollowUpSuggestion[];
  disabled?: boolean;
  onPress: (prompt: string) => void;
};

export default function AICoachFollowUpChips({ suggestions, disabled = false, onPress }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Helpful follow-ups</Text>
      <View style={styles.wrap}>
        {suggestions.map((item) => (
          <Pressable
            key={item.id}
            disabled={disabled}
            onPress={() => onPress(item.prompt)}
            style={[styles.chip, disabled && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Text style={styles.chipText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: "#F8FAFC",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
  },
});
