import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme";

type WellnessIntelligenceSectionProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function WellnessIntelligenceSection({ title, subtitle, children }: WellnessIntelligenceSectionProps) {
  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  title: { color: colors.text, fontSize: 20, fontWeight: "900", letterSpacing: -0.3 },
  subtitle: { marginTop: spacing.xs, color: colors.mutedText, fontSize: 13, lineHeight: 19, fontWeight: "600" },
});
