import { FileText, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "../../theme";

type ReportCenterHeroProps = {
  score: number;
  summary: string;
  activePlanCode: string;
};

export function ReportCenterHero({ score, summary, activePlanCode }: ReportCenterHeroProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconShell}>
          <FileText size={26} color={colors.white} />
        </View>
        <View style={styles.livePill}>
          <Sparkles size={13} color={colors.primaryDark} />
          <Text style={styles.liveText}>AI Report Center</Text>
        </View>
      </View>

      <Text style={styles.kicker}>Sprint 20</Text>
      <Text style={styles.title}>Health Reports</Text>
      <Text style={styles.score}>{score}/100</Text>
      <Text style={styles.summary}>{summary}</Text>
      <Text style={styles.plan}>Active plan: {activePlanCode.replaceAll("_", " ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 34,
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
    gap: spacing.md,
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
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.softGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  liveText: {
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
  title: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "900",
  },
  score: {
    color: colors.white,
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "900",
  },
  summary: {
    color: colors.softGreen,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
  },
  plan: {
    color: colors.mint,
    fontSize: 12,
    fontWeight: "900",
  },
});
