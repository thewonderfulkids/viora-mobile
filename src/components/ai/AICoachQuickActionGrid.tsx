import { Pressable, StyleSheet, Text, View } from "react-native";
import { AICoachQuickAction } from "../../types";
import { colors, radius, spacing } from "../../theme";

type Props = {
  actions: AICoachQuickAction[];
  disabled?: boolean;
  onPress: (prompt: string) => void;
};

export default function AICoachQuickActionGrid({ actions, disabled = false, onPress }: Props) {
  if (actions.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {actions.map((item) => (
        <Pressable
          key={item.id}
          disabled={disabled}
          onPress={() => onPress(item.prompt)}
          style={[styles.action, disabled && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel={item.label}
        >
          <Text style={styles.text}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  action: {
    backgroundColor: "#F5F3FF",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
  },
});
