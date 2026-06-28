import { Pressable, StyleSheet, Text } from "react-native";

import { radius, spacing } from "../../theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function AISuggestionCard({
  title,
  onPress,
  disabled = false,
}: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.disabled]}
    >
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F5F3FF",
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: "#6D28D9",
    fontWeight: "800",
  },
});