import { LinearGradient } from "expo-linear-gradient";
import { Brain, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { DashboardBriefing } from "../../types/dashboardIntelligence";
import { colors, radius, spacing } from "../../theme";

export function DashboardBriefingCard({ briefing }: { briefing: DashboardBriefing }) {
  return (
    <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconShell}>
          <Brain size={22} color={colors.white} />
        </View>
        <View style={styles.badge}>
          <Sparkles size={13} color={colors.primaryDark} />
          <Text style={styles.badgeText}>AI Daily Briefing</Text>
        </View>
      </View>

      <Text style={styles.greeting}>{briefing.greeting}</Text>
      <Text style={styles.headline}>{briefing.headline}</Text>
      <Text style={styles.summary}>{briefing.summary}</Text>

      <View style={styles.focusBox}>
        <Text style={styles.focusLabel}>Today&apos;s Priority</Text>
        <Text style={styles.focusTitle}>{briefing.focus}</Text>
        <Text style={styles.focusText}>{briefing.recommendation}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 32,
    padding: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  iconShell: {
    width: 52,
    height: 52,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.mint,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  greeting: {
    color: colors.softGreen,
    fontSize: 14,
    fontWeight: "800",
  },
  headline: {
    color: colors.white,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  summary: {
    color: colors.softGreen,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },
  focusBox: {
    marginTop: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    gap: spacing.xs,
  },
  focusLabel: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  focusTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  focusText: {
    color: colors.softGreen,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
});
