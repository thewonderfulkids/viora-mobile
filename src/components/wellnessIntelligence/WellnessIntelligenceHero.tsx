import { BrainCircuit } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { WellnessFocusArea } from "../../types/wellnessIntelligence";
import { colors, radius, spacing } from "../../theme";

type WellnessIntelligenceHeroProps = {
  dailyWellnessIndex: number;
  weeklyAverageScore: number;
  riskLevel: "low" | "medium" | "high";
  primaryFocus: WellnessFocusArea;
  summary: string;
};

function labelFocus(value: WellnessFocusArea) {
  return value.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function WellnessIntelligenceHero({ dailyWellnessIndex, weeklyAverageScore, riskLevel, primaryFocus, summary }: WellnessIntelligenceHeroProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <BrainCircuit size={30} color={colors.white} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>AI Wellness Intelligence</Text>
          <Text style={styles.title}>Daily Wellness Index</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.score}>{dailyWellnessIndex}</Text>
          <Text style={styles.scoreLabel}>Today</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metaWrap}>
          <Text style={styles.metaText}>Weekly Avg: {weeklyAverageScore}</Text>
          <Text style={styles.metaText}>Risk: {riskLevel.toUpperCase()}</Text>
          <Text style={styles.metaText}>Focus: {labelFocus(primaryFocus)}</Text>
        </View>
      </View>

      <Text style={styles.summary}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.primaryDark, borderRadius: radius.xxl, padding: spacing.xl, gap: spacing.lg },
  topRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBox: { width: 58, height: 58, borderRadius: 22, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  titleWrap: { flex: 1 },
  eyebrow: { color: "#BFEBD8", fontSize: 12, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  title: { marginTop: 4, color: colors.white, fontSize: 28, lineHeight: 34, fontWeight: "900", letterSpacing: -0.8 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  score: { color: colors.white, fontSize: 58, lineHeight: 64, fontWeight: "900", letterSpacing: -2 },
  scoreLabel: { color: "#BFEBD8", fontSize: 12, fontWeight: "900", textAlign: "center" },
  divider: { width: 1, height: 70, backgroundColor: "rgba(255,255,255,0.18)" },
  metaWrap: { flex: 1, gap: spacing.xs },
  metaText: { color: "#E8FFF4", fontSize: 13, fontWeight: "800" },
  summary: { color: "#E8FFF4", fontSize: 14, lineHeight: 21, fontWeight: "700" },
});
