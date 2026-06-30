import { Gift } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PremiumPlanCode, PremiumProgramEntitlement } from "../../types/premium";

export function ProgramEntitlementList({ items, activePlanCode }: { items: PremiumProgramEntitlement[]; activePlanCode: PremiumPlanCode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>AI Wellness Programs</Text>
      <Text style={styles.subtitle}>Yoga, home workout and weight-loss programs will use this entitlement engine without changing subscriptions later.</Text>

      <View style={styles.list}>
        {items.map((item) => {
          const included = item.includedInPlanCodes.includes(activePlanCode);
          const discount = item.discountPercentByPlan[activePlanCode] || 0;

          return (
            <View key={item.programId} style={styles.row}>
              <View style={styles.iconShell}>
                <Gift size={17} color={colors.primary} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name}>{item.title}</Text>
                <Text style={styles.meta}>{item.durationDays} days · {included ? "Included" : `${discount}% discount`}</Text>
              </View>
            </View>
          );
        })}
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
    alignItems: "center",
    gap: spacing.md,
  },
  iconShell: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.softGreen,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  meta: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
  },
});
