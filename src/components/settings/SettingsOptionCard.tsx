import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type SettingsOptionCardProps<T extends string> = {
  label: string;
  value: T;
  selected: boolean;
  description?: string;
  onSelect: (value: T) => void;
};

export function SettingsOptionCard<T extends string>({ label, value, selected, description, onSelect }: SettingsOptionCardProps<T>) {
  return (
    <Pressable onPress={() => onSelect(value)} style={[styles.card, selected ? styles.selected : null]}>
      <View style={[styles.dot, selected ? styles.dotSelected : null]} />
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: spacing.lg,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  copy: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  description: {
    marginTop: 3,
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
});
