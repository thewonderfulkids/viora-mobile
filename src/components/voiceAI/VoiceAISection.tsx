import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "../../theme";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function VoiceAISection({ title, subtitle, children }: Props) {
  return (
    <View style={styles.section}>
      <View>
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
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: spacing.xs,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
  },
});
