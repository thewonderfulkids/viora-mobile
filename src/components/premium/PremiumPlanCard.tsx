import { Check, Crown } from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PremiumPlan, PremiumPlanCode } from "../../types/premium";

function formatPrice(plan: PremiumPlan) {
  if (plan.priceInr === 0) return "Free";
  const suffix = plan.billingCycle === "monthly" ? "/mo" : plan.billingCycle === "yearly" ? "/yr" : "";
  return `₹${plan.priceInr.toLocaleString("en-IN")}${suffix}`;
}

type Props = {
  plan: PremiumPlan;
  activePlanCode: PremiumPlanCode;
  processing: boolean;
  onSelect: (planCode: PremiumPlanCode) => void;
};

export function PremiumPlanCard({ plan, activePlanCode, processing, onSelect }: Props) {
  const isActive = activePlanCode === plan.code;
  const isElite = plan.code === "ELITE_FAMILY_YEARLY";

  return (
    <View style={[styles.card, plan.popular && styles.popularCard, isElite && styles.eliteCard]}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.badge}>{plan.badge}</Text>
          <Text style={styles.name}>{plan.displayName}</Text>
        </View>
        {isElite ? <Crown size={22} color={colors.warning} /> : null}
      </View>

      <Text style={styles.description}>{plan.description}</Text>

      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatPrice(plan)}</Text>
        {plan.compareAtPriceInr ? <Text style={styles.compare}>₹{plan.compareAtPriceInr.toLocaleString("en-IN")}</Text> : null}
      </View>

      <View style={styles.featureList}>
        {plan.featureSummary.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Check size={15} color={colors.primary} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <Pressable
        disabled={isActive || processing || plan.code === "FREE"}
        onPress={() => onSelect(plan.code)}
        style={({ pressed }) => [
          styles.button,
          isElite && styles.eliteButton,
          isActive && styles.activeButton,
          pressed && styles.pressed,
        ]}
      >
        {processing ? <ActivityIndicator color={colors.white} /> : <Text style={[styles.buttonText, isActive && styles.activeButtonText]}>{isActive ? "Current Plan" : plan.ctaLabel}</Text>}
      </Pressable>
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
  popularCard: {
    borderColor: colors.primary,
    backgroundColor: colors.softGreen,
  },
  eliteCard: {
    borderColor: colors.warning,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  badge: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
  },
  description: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  price: {
    color: colors.primaryDark,
    fontSize: 28,
    fontWeight: "900",
  },
  compare: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: "800",
    textDecorationLine: "line-through",
    marginBottom: 4,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  button: {
    marginTop: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  eliteButton: {
    backgroundColor: colors.primaryDark,
  },
  activeButton: {
    backgroundColor: colors.border,
  },
  buttonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  activeButtonText: {
    color: colors.mutedText,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
});
