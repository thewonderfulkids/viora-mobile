import { Brain, Crown, UserRound } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { SettingsDashboard } from "../../types";

type AccountSummaryCardProps = {
  dashboard: SettingsDashboard;
};

export function AccountSummaryCard({ dashboard }: AccountSummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.heroRow}>
        <View style={styles.avatar}>
          <UserRound size={24} color={colors.white} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.name}>{dashboard.accountSummary.displayName}</Text>
          <Text style={styles.email}>{dashboard.accountSummary.email}</Text>
        </View>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statCard}>
          <Crown size={18} color={colors.primary} />
          <Text style={styles.statValue}>{dashboard.accountSummary.planName}</Text>
          <Text style={styles.statLabel}>Current Plan</Text>
        </View>
        <View style={styles.statCard}>
          <Brain size={18} color={colors.primary} />
          <Text style={styles.statValue}>{dashboard.accountSummary.aiMemoryStatus}</Text>
          <Text style={styles.statLabel}>AI Memory</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryDark,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  copy: {
    flex: 1,
  },
  name: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "900",
  },
  email: {
    marginTop: 3,
    color: colors.softGreen,
    fontSize: 13,
    fontWeight: "700",
  },
  statGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    padding: spacing.md,
    gap: 4,
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: "700",
  },
});
