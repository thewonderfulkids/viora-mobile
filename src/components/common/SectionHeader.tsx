import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "../../theme";

type SectionHeaderProps = {
  label?: string;
  title: string;
  subtitle?: string;
};

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.xl,
  },
  label: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  title: {
    marginTop: spacing.sm,
    color: colors.text,
    ...typography.title,
  },
  subtitle: {
    marginTop: spacing.sm,
    color: colors.mutedText,
    ...typography.body,
  },
});