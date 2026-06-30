import { Crown, UsersRound } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";
import { FamilyDashboard } from "../../types";

type Props = { dashboard: FamilyDashboard };

export function FamilyHero({ dashboard }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconShell}>
        <UsersRound size={26} color={colors.white} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.kicker}>Family Wellness</Text>
        <Text style={styles.title}>{dashboard.family.name}</Text>
        <Text style={styles.summary}>{dashboard.aiSummary}</Text>
      </View>

      <View style={styles.planPill}>
        <Crown size={14} color={colors.primaryDark} />
        <Text style={styles.planText}>{dashboard.eliteFamilyReady ? "Elite Family" : "Family Ready"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  copy: {
    gap: spacing.xs,
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  summary: {
    color: colors.softGreen,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
  },
  planPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.mint,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  planText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
});
