import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "../../theme";

type SettingsSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function SettingsSection({ title, subtitle, children }: SettingsSectionProps) {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    ...typography.sectionTitle,
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    ...typography.caption,
  },
});
