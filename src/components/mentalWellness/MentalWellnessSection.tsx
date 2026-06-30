import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../../theme";

type MentalWellnessSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function MentalWellnessSection({ title, subtitle, children }: MentalWellnessSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    ...typography.sectionTitle,
  },
  subtitle: {
    color: colors.mutedText,
    ...typography.caption,
  },
});
