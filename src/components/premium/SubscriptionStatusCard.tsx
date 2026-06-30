import { CalendarDays, Users } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { PremiumPlan, UserSubscription } from "../../types/premium";

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function SubscriptionStatusCard({ plan, subscription }: { plan: PremiumPlan; subscription: UserSubscription }) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Current Membership</Text>
      <Text style={styles.title}>{plan.displayName}</Text>
      <Text style={styles.subtitle}>{subscription.status.toUpperCase()} · Invoice owner stays linked to this user account.</Text>

      <View style={styles.grid}>
        <View style={styles.tile}>
          <CalendarDays size={18} color={colors.primary} />
          <Text style={styles.tileLabel}>Renewal</Text>
          <Text style={styles.tileValue}>{formatDate(subscription.renewalDate || subscription.expiresAt)}</Text>
        </View>
        <View style={styles.tile}>
          <Users size={18} color={colors.primary} />
          <Text style={styles.tileLabel}>Members</Text>
          <Text style={styles.tileValue}>{plan.maxMembers}</Text>
        </View>
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
  kicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.softGreen,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  tileLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  tileValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
});
