import { CheckCircle2, Circle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PremiumPlanFeature } from "../../types/premium";

export function PremiumFeatureComparison({ features }: { features: PremiumPlanFeature[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Your Active Entitlements</Text>
      <Text style={styles.subtitle}>These switches power premium gates across AI Coach, reports, programs, voice AI and family accounts.</Text>

      <View style={styles.list}>
        {features.map((feature) => (
          <View key={feature.key} style={styles.row}>
            {feature.included ? <CheckCircle2 size={18} color={colors.primary} /> : <Circle size={18} color={colors.mutedText} />}
            <View style={styles.copy}>
              <Text style={styles.label}>{feature.label}</Text>
              <Text style={styles.description}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  copy: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
  },
});
