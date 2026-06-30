import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";

type DashboardIntelligenceSectionProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function DashboardIntelligenceSection({ title, subtitle, children }: DashboardIntelligenceSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.25,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
