import { Brain, HeartPulse, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { MentalWellnessDashboard } from "../../types";
import { colors, radius, spacing, typography } from "../../theme";

type MentalWellnessHeroProps = {
  dashboard: MentalWellnessDashboard;
};

function riskLabel(risk: MentalWellnessDashboard["summary"]["riskLevel"]) {
  if (risk === "low") return "Stable";
  if (risk === "medium") return "Needs care";
  return "High load";
}

export function MentalWellnessHero({ dashboard }: MentalWellnessHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconShell}>
          <Brain size={28} color={colors.white} />
        </View>
        <View style={styles.badge}>
          <ShieldCheck size={15} color={colors.primaryDark} />
          <Text style={styles.badgeText}>{riskLabel(dashboard.summary.riskLevel)}</Text>
        </View>
      </View>

      <Text style={styles.kicker}>Mental Wellness Intelligence</Text>
      <Text style={styles.score}>{dashboard.emotionalBalanceScore}%</Text>
      <Text style={styles.title}>Emotional Balance Score</Text>
      <Text style={styles.summary}>{dashboard.summary.aiSummary}</Text>

      <View style={styles.footerGrid}>
        <View style={styles.footerItem}>
          <HeartPulse size={16} color={colors.mint} />
          <Text style={styles.footerValue}>{dashboard.summary.moodScore}%</Text>
          <Text style={styles.footerLabel}>Mood</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{dashboard.summary.stressScore}%</Text>
          <Text style={styles.footerLabel}>Stress Safety</Text>
        </View>
        <View style={styles.footerItem}>
          <Text style={styles.footerValue}>{dashboard.summary.checkInStreak}</Text>
          <Text style={styles.footerLabel}>Streak</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    backgroundColor: colors.primaryDark,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.xl,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconShell: {
    width: 58,
    height: 58,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.mint,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  kicker: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  score: {
    color: colors.white,
    fontSize: 56,
    lineHeight: 62,
    fontWeight: "900",
    letterSpacing: -1,
  },
  title: {
    color: colors.white,
    ...typography.sectionTitle,
  },
  summary: {
    color: colors.softGreen,
    ...typography.caption,
  },
  footerGrid: {
    marginTop: spacing.sm,
    flexDirection: "row",
    gap: spacing.sm,
  },
  footerItem: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: spacing.md,
    gap: spacing.xs,
  },
  footerValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  footerLabel: {
    color: colors.softGreen,
    fontSize: 11,
    fontWeight: "800",
  },
});
