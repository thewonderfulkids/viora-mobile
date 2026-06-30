import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { VoiceQuickAction } from "../../types";

type Props = {
  actions: VoiceQuickAction[];
  onSelect: (command: string) => void;
};

export function VoiceQuickActionGrid({ actions, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={() => onSelect(action.command)}
          style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
          <Text style={styles.icon}>{action.icon}</Text>
          <Text style={styles.label}>{action.label}</Text>
          <Text style={styles.command}>“{action.command}”</Text>
          <Text style={styles.helper}>{action.helper}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.md,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    marginTop: spacing.sm,
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  command: {
    marginTop: spacing.xs,
    color: colors.primaryDark,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "900",
  },
  helper: {
    marginTop: 4,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
